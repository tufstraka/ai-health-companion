export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'deleteUser' : IDL.Func(
        [IDL.Text],
        [
          IDL.Variant({
            'Ok' : IDL.Bool,
            'Err' : IDL.Record({ 'code' : IDL.Text, 'message' : IDL.Text }),
          }),
        ],
        [],
      ),
    'getAllHealthData' : IDL.Func(
        [],
        [
          IDL.Variant({
            'Ok' : IDL.Vec(
              IDL.Record({
                'id' : IDL.Text,
                'userId' : IDL.Text,
                'medications' : IDL.Vec(IDL.Text),
                'professional' : IDL.Record({
                  'bloodWork' : IDL.Text,
                  'urinalysis' : IDL.Text,
                  'ecgReadings' : IDL.Text,
                  'imaging' : IDL.Text,
                }),
                'notes' : IDL.Text,
                'timestamp' : IDL.Text,
                'symptoms' : IDL.Vec(IDL.Text),
                'activity' : IDL.Record({
                  'activeMinutes' : IDL.Text,
                  'steps' : IDL.Text,
                  'sleepHours' : IDL.Text,
                }),
                'vitals' : IDL.Record({
                  'respiratoryRate' : IDL.Text,
                  'oxygenLevel' : IDL.Text,
                  'temperature' : IDL.Text,
                  'bloodPressure' : IDL.Text,
                  'glucose' : IDL.Text,
                  'heartRate' : IDL.Text,
                }),
              })
            ),
            'Err' : IDL.Record({ 'code' : IDL.Text, 'message' : IDL.Text }),
          }),
        ],
        ['query'],
      ),
    'getAllPredictions' : IDL.Func(
        [],
        [
          IDL.Variant({
            'Ok' : IDL.Vec(
              IDL.Record({
                'id' : IDL.Text,
                'prediction' : IDL.Text,
                'healthDataId' : IDL.Text,
                'timestamp' : IDL.Text,
                'confidence' : IDL.Text,
                'modelId' : IDL.Text,
              })
            ),
            'Err' : IDL.Record({ 'code' : IDL.Text, 'message' : IDL.Text }),
          }),
        ],
        ['query'],
      ),
    'getAllUsers' : IDL.Func(
        [],
        [
          IDL.Variant({
            'Ok' : IDL.Vec(
              IDL.Record({
                'id' : IDL.Text,
                'username' : IDL.Text,
                'email' : IDL.Text,
              })
            ),
            'Err' : IDL.Record({ 'code' : IDL.Text, 'message' : IDL.Text }),
          }),
        ],
        ['query'],
      ),
    'getHealthDataById' : IDL.Func(
        [IDL.Text],
        [
          IDL.Variant({
            'Ok' : IDL.Record({
              'id' : IDL.Text,
              'userId' : IDL.Text,
              'medications' : IDL.Vec(IDL.Text),
              'professional' : IDL.Record({
                'bloodWork' : IDL.Text,
                'urinalysis' : IDL.Text,
                'ecgReadings' : IDL.Text,
                'imaging' : IDL.Text,
              }),
              'notes' : IDL.Text,
              'timestamp' : IDL.Text,
              'symptoms' : IDL.Vec(IDL.Text),
              'activity' : IDL.Record({
                'activeMinutes' : IDL.Text,
                'steps' : IDL.Text,
                'sleepHours' : IDL.Text,
              }),
              'vitals' : IDL.Record({
                'respiratoryRate' : IDL.Text,
                'oxygenLevel' : IDL.Text,
                'temperature' : IDL.Text,
                'bloodPressure' : IDL.Text,
                'glucose' : IDL.Text,
                'heartRate' : IDL.Text,
              }),
            }),
            'Err' : IDL.Record({ 'code' : IDL.Text, 'message' : IDL.Text }),
          }),
        ],
        ['query'],
      ),
    'getSystemStats' : IDL.Func(
        [],
        [
          IDL.Variant({
            'Ok' : IDL.Record({
              'totalPredictions' : IDL.Nat64,
              'totalUsers' : IDL.Nat64,
              'totalRecords' : IDL.Nat64,
            }),
            'Err' : IDL.Record({ 'code' : IDL.Text, 'message' : IDL.Text }),
          }),
        ],
        ['query'],
      ),
    'getUserById' : IDL.Func(
        [IDL.Text],
        [
          IDL.Variant({
            'Ok' : IDL.Record({
              'id' : IDL.Text,
              'username' : IDL.Text,
              'email' : IDL.Text,
            }),
            'Err' : IDL.Record({ 'code' : IDL.Text, 'message' : IDL.Text }),
          }),
        ],
        ['query'],
      ),
    'loginUser' : IDL.Func(
        [IDL.Text],
        [
          IDL.Variant({
            'Ok' : IDL.Record({
              'id' : IDL.Text,
              'username' : IDL.Text,
              'email' : IDL.Text,
            }),
            'Err' : IDL.Record({ 'code' : IDL.Text, 'message' : IDL.Text }),
          }),
        ],
        ['query'],
      ),
    'registerUser' : IDL.Func(
        [
          IDL.Record({
            'id' : IDL.Text,
            'username' : IDL.Text,
            'email' : IDL.Text,
          }),
        ],
        [
          IDL.Variant({
            'Ok' : IDL.Record({
              'id' : IDL.Text,
              'username' : IDL.Text,
              'email' : IDL.Text,
            }),
            'Err' : IDL.Record({ 'code' : IDL.Text, 'message' : IDL.Text }),
          }),
        ],
        [],
      ),
    'saveAIAnalysis' : IDL.Func(
        [
          IDL.Record({
            'id' : IDL.Text,
            'prediction' : IDL.Text,
            'healthDataId' : IDL.Text,
            'timestamp' : IDL.Text,
            'confidence' : IDL.Text,
            'modelId' : IDL.Text,
          }),
        ],
        [
          IDL.Variant({
            'Ok' : IDL.Record({
              'id' : IDL.Text,
              'prediction' : IDL.Text,
              'healthDataId' : IDL.Text,
              'timestamp' : IDL.Text,
              'confidence' : IDL.Text,
              'modelId' : IDL.Text,
            }),
            'Err' : IDL.Record({ 'code' : IDL.Text, 'message' : IDL.Text }),
          }),
        ],
        [],
      ),
    'saveHealthData' : IDL.Func(
        [
          IDL.Record({
            'id' : IDL.Text,
            'userId' : IDL.Text,
            'medications' : IDL.Vec(IDL.Text),
            'professional' : IDL.Record({
              'bloodWork' : IDL.Text,
              'urinalysis' : IDL.Text,
              'ecgReadings' : IDL.Text,
              'imaging' : IDL.Text,
            }),
            'notes' : IDL.Text,
            'timestamp' : IDL.Text,
            'symptoms' : IDL.Vec(IDL.Text),
            'activity' : IDL.Record({
              'activeMinutes' : IDL.Text,
              'steps' : IDL.Text,
              'sleepHours' : IDL.Text,
            }),
            'vitals' : IDL.Record({
              'respiratoryRate' : IDL.Text,
              'oxygenLevel' : IDL.Text,
              'temperature' : IDL.Text,
              'bloodPressure' : IDL.Text,
              'glucose' : IDL.Text,
              'heartRate' : IDL.Text,
            }),
          }),
        ],
        [
          IDL.Variant({
            'Ok' : IDL.Record({
              'id' : IDL.Text,
              'userId' : IDL.Text,
              'medications' : IDL.Vec(IDL.Text),
              'professional' : IDL.Record({
                'bloodWork' : IDL.Text,
                'urinalysis' : IDL.Text,
                'ecgReadings' : IDL.Text,
                'imaging' : IDL.Text,
              }),
              'notes' : IDL.Text,
              'timestamp' : IDL.Text,
              'symptoms' : IDL.Vec(IDL.Text),
              'activity' : IDL.Record({
                'activeMinutes' : IDL.Text,
                'steps' : IDL.Text,
                'sleepHours' : IDL.Text,
              }),
              'vitals' : IDL.Record({
                'respiratoryRate' : IDL.Text,
                'oxygenLevel' : IDL.Text,
                'temperature' : IDL.Text,
                'bloodPressure' : IDL.Text,
                'glucose' : IDL.Text,
                'heartRate' : IDL.Text,
              }),
            }),
            'Err' : IDL.Record({ 'code' : IDL.Text, 'message' : IDL.Text }),
          }),
        ],
        [],
      ),
    'updateUser' : IDL.Func(
        [
          IDL.Record({
            'id' : IDL.Text,
            'username' : IDL.Text,
            'email' : IDL.Text,
          }),
        ],
        [
          IDL.Variant({
            'Ok' : IDL.Record({
              'id' : IDL.Text,
              'username' : IDL.Text,
              'email' : IDL.Text,
            }),
            'Err' : IDL.Record({ 'code' : IDL.Text, 'message' : IDL.Text }),
          }),
        ],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };