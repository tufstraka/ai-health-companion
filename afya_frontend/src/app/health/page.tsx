'use client'

import { useState, useEffect } from 'react'
import { useAzureHealth } from '@/hooks/useAIAnalysis'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, X, Activity, Heart, Brain, Thermometer, LogOut } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createActor, getPrincipal, logout } from '@/services/icp'
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from 'next/navigation'

import { VitalSigns, ActivityMetrics } from '@/types/health'
import { BackendService } from '@/types/actor'
import ReactMarkdown from 'react-markdown'

interface Professional {
  ecgReadings: string;
  bloodWork: string;
  urinalysis: string;
  imaging: string;
}

interface FormData {
  id: string;
  VitalSigns: VitalSigns;
  ActivityMetrics: ActivityMetrics;
  professional: Professional;
  notes: string;
}

export default function HealthDashboard() {
  const { analyzeHealth, isLoading, error, setIsLoading } = useAzureHealth()
  const [mode, setMode] = useState('simple')
  const [analysisResults, setAnalysisResults] = useState<string | null>(null)
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [newSymptom, setNewSymptom] = useState('')
  const [medications, setMedications] = useState<string[]>([])
  const [newMedication, setNewMedication] = useState('')
  const [isCelsius, setIsCelsius] = useState(true)
  const [actor, setActor] = useState<BackendService | null>(null)
  const [principal, setPrincipal] = useState<string | null>(null)
  const [formId] = useState(() => uuidv4())
  const router  = useRouter() 

  const [formData, setFormData] = useState<FormData>({
    id: formId,
    VitalSigns: {
      heartRate: '75',
      bloodPressure: '120/80',
      temperature: '98.6',
      oxygenLevel: '98',
      respiratoryRate: '16',
      glucose: '95'
    },
    ActivityMetrics: {
      steps: '8000',
      sleepHours: '7.5',
      activeMinutes: '45',
    },
    professional: {
      ecgReadings: '',
      bloodWork: '',
      urinalysis: '',
      imaging: ''
    },
    notes: ''
  })

  useEffect(() => {
    const fetchActor = async () => {
      try {
        const newActor = await createActor()
        setActor(newActor)
        const principalData = await getPrincipal()
        setPrincipal(principalData?.principal?.toText() || null)
      } catch (err) {
        console.error('Error fetching actor:', err)
      }
    }

    fetchActor()
  }, [])

  const celsiusToFahrenheit = (celsius: number) => (celsius * 9/5) + 32
  const fahrenheitToCelsius = (fahrenheit: number) => (fahrenheit - 32) * 5/9

  const handleTemperatureUnitChange = (checked: boolean) => {
    setIsCelsius(checked)
    const currentTemp = parseFloat(formData.VitalSigns.temperature)
    setFormData(prev => ({
      ...prev,
      VitalSigns: {
        ...prev.VitalSigns,
        temperature: checked
          ? fahrenheitToCelsius(currentTemp).toFixed(1)
          : celsiusToFahrenheit(currentTemp).toFixed(1)
      }
    }))
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)

    }
  }

  const handleInputChange = (category: keyof FormData, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] as object),
        [field]: value
      }
    }))
  }

  const addSymptom = () => {
    if (newSymptom && !symptoms.includes(newSymptom)) {
      setSymptoms(prev => [...prev, newSymptom])
      setNewSymptom('')
    }
  }

  const addMedication = () => {
    if (newMedication && !medications.includes(newMedication)) {
      setMedications(prev => [...prev, newMedication])
      setNewMedication('')
    }
  }

  const removeSymptom = (symptom: string) => {
    setSymptoms(prev => prev.filter(s => s !== symptom))
  }

  const removeMedication = (medication: string) => {
    setMedications(prev => prev.filter(m => m !== medication))
  }

  const handleAnalysis = async () => {
    setIsLoading(true)
    if (!actor || !principal) {
      console.error('Actor or principal not initialized')
      return
    }

    const healthData = {
      vitals: formData.VitalSigns,
      activity: formData.ActivityMetrics,
      symptoms,
      medications,
      notes: formData.notes,
      ...(mode === 'professional' && {
        professional: formData.professional
      })
    }

    try {
      const initialHealthData = {
        id: formId,
        userId: principal,
        timestamp: new Date().toISOString(),
        vitals: healthData.vitals,
        activity: healthData.activity,
        symptoms: healthData.symptoms,
        medications: healthData.medications,
        notes: healthData.notes,
        professional: healthData.professional || {
          ecgReadings: '',
          bloodWork: '',
          urinalysis: '',
          imaging: ''
        }
      }

      const saveResult = await actor.saveHealthData(initialHealthData)

      console.log('Save result:', saveResult)
      if ('Err' in saveResult) {
        console.error('Failed to save initial health data:', saveResult.Err)
        return
      }

      // Perform analysis
      const analysis = await analyzeHealth(healthData)
      if (!analysis?.choices?.[0]?.message?.content) {
        console.error('Invalid analysis response')
        return
      }

      console.log('Analysis results:', analysis)

      setAnalysisResults(analysis.choices[0].message.content)

      // Save analysis results
      const aiPrediction = {
        healthDataId: formId,
        id: uuidv4(),
        prediction: analysis.choices[0].message.content,
        confidence: analysis.choices[0].message.confidence || 'test',
        modelId: analysis.model || 'unknown',
        timestamp: new Date().toISOString()
      }

      const predictionResult = await actor.saveAIAnalysis(aiPrediction)

      console.log('Prediction result:', predictionResult)
      setIsLoading(false)
      if ('Err' in predictionResult) {
        setIsLoading(false)
        console.error('Failed to save AI prediction:', predictionResult.Err)
      }

    } catch (err) {
      console.error('Analysis error:', err)
    }
  }

  const renderResults = () => {
    if (!analysisResults) return null

    try {
      const parsed = JSON.parse(analysisResults)
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(parsed.VitalSigns || {}).map(([key, value]) => (
            <div key={key} className="bg-white/50 p-4 rounded-lg">
              <div className="text-sm text-slate-500 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div className="text-lg font-semibold">{String(value)}</div>
            </div>
          ))}
        </div>
      )
    } catch {
      return (
        <div className="prose prose-slate max-w-none">
          <ReactMarkdown>{analysisResults}</ReactMarkdown>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-800">Health is Wealth</h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">°F</span>
              <Switch
                checked={isCelsius}
                onCheckedChange={handleTemperatureUnitChange}
              />
              <span className="text-sm text-slate-600">°C</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">Expert Mode</span>
              <Switch
                checked={mode === 'professional'}
                onCheckedChange={(checked) => setMode(checked ? 'professional' : 'simple')}
              />
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-white/50 hover:bg-white/80 text-slate-700 border-slate-200/50 shadow-sm flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* VitalSigns Card */}
          <Card className="col-span-1 bg-white/50 backdrop-blur-sm border-slate-200/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              Vital Signs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Heart Rate (BPM)</label>
              <Input
                type="number"
                value={formData.VitalSigns.heartRate}
                onChange={(e) => handleInputChange('VitalSigns', 'heartRate', e.target.value)}
                className="bg-white/50"
                placeholder="60-100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Blood Pressure</label>
              <Input
                value={formData.VitalSigns.bloodPressure}
                onChange={(e) => handleInputChange('VitalSigns', 'bloodPressure', e.target.value)}
                className="bg-white/50"
                placeholder="120/80"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Temperature ({isCelsius ? '°C' : '°F'})
              </label>
              <Slider
                value={[parseFloat(formData.VitalSigns.temperature)]}
                onValueChange={([value]) => handleInputChange('VitalSigns', 'temperature', value.toString())}
                min={isCelsius ? 35 : 95}
                max={isCelsius ? 42 : 107}
                step={0.1}
                className="py-4"
              />
              <div className="text-center text-sm font-medium text-slate-600">
                {formData.VitalSigns.temperature}°{isCelsius ? 'C' : 'F'}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Glucose (mmol/L)</label>
              <Input
                type="number"
                value={formData.VitalSigns.glucose}
                onChange={(e) => handleInputChange('VitalSigns', 'glucose', e.target.value)}
                className="bg-white/50"
                placeholder="4.0-10.0"
              />
            </div>
          </CardContent>
        </Card>

          {/* ActivityMetrics Card */}
          <Card className="col-span-1 bg-white/50 backdrop-blur-sm border-slate-200/50 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Steps Today</label>
                <Input
                  type="number"
                  value={formData.ActivityMetrics.steps}
                  onChange={(e) => handleInputChange('ActivityMetrics', 'steps', e.target.value)}
                  className="bg-white/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Sleep (hours)</label>
                <Slider
                  value={[parseFloat(formData.ActivityMetrics.sleepHours)]}
                  onValueChange={([value]) => handleInputChange('ActivityMetrics', 'sleepHours', value.toString())}
                  min={0}
                  max={12}
                  step={0.5}
                  className="py-4"
                />
                <div className="text-center text-sm font-medium text-slate-600">
                  {formData.ActivityMetrics.sleepHours} hours
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Active Minutes</label>
                <Input
                  type="number"
                  value={formData.ActivityMetrics.activeMinutes}
                  onChange={(e) => handleInputChange('ActivityMetrics', 'activeMinutes', e.target.value)}
                  className="bg-white/50"
                />
              </div>
            </CardContent>
          </Card>

          {/* Symptoms & Medications Card */}
          <Card className="col-span-1 bg-white/50 backdrop-blur-sm border-slate-200/50 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-500" />
                Symptoms & Medications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Symptoms</label>
                <div className="flex gap-2">
                  <Input
                    value={newSymptom}
                    onChange={(e) => setNewSymptom(e.target.value)}
                    placeholder="Add a symptom"
                    className="bg-white/50"
                  />
                  <Button onClick={addSymptom} size="sm" className="bg-indigo-500 hover:bg-indigo-600">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {symptoms.map((symptom, index) => (
                    <Badge key={index} variant="secondary" className="bg-white/80">
                      {symptom}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer"
                        onClick={() => removeSymptom(symptom)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Medications</label>
                <div className="flex gap-2">
                  <Input
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    placeholder="Add a medication"
                    className="bg-white/50"
                  />
                  <Button onClick={addMedication} size="sm" className="bg-indigo-500 hover:bg-indigo-600">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {medications.map((medication, index) => (
                    <Badge key={index} variant="secondary" className="bg-white/80">
                      {medication}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer"
                        onClick={() => removeMedication(medication)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {mode === 'professional' && (
          <Card className="bg-white/50 backdrop-blur-sm border-slate-200/50 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-violet-500" />
                Professional Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="bloodwork">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="bloodwork">Blood Work</TabsTrigger>
                  <TabsTrigger value="ecg">ECG Readings</TabsTrigger>
                  <TabsTrigger value="imaging">Imaging</TabsTrigger>
                </TabsList>
                <div className="mt-4">
                  <TabsContent value="bloodwork">
                    <textarea
                      className="w-full h-32 p-2 rounded-md bg-white/50 border border-slate-200"
                      placeholder="Enter blood work results..."
                      value={formData.professional.bloodWork}
                      onChange={(e) => handleInputChange('professional', 'bloodWork', e.target.value)}
                    />
                  </TabsContent>
                  <TabsContent value="ecg">
                    <textarea
                      className="w-full h-32 p-2 rounded-md bg-white/50 border border-slate-200"
                      placeholder="Enter ECG readings..."
                      value={formData.professional.ecgReadings}
                      onChange={(e) => handleInputChange('professional', 'ecgReadings', e.target.value)}
                    />
                  </TabsContent>
                  <TabsContent value="imaging">
                    <textarea
                      className="w-full h-32 p-2 rounded-md bg-white/50 border border-slate-200"
                      placeholder="Enter imaging results..."
                      value={formData.professional.imaging}
                      onChange={(e) => handleInputChange('professional', 'imaging', e.target.value)}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center pt-6">
          <Button
            onClick={handleAnalysis}
            disabled={isLoading}
            className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white px-8 py-6 text-lg shadow-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing Health Data...

            </>
            ) : (
              'Analyze Health Data'
            )}
          </Button>
        </div>

        {analysisResults && (
          <Card className="bg-white/50 backdrop-blur-sm border-slate-200/50 shadow-xl mt-6">
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {renderResults()}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}