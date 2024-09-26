import configProd from './prod'
// import configDev from './dev'

export var config: any
config = configProd

// if (process.env.NODE_ENV === 'production') {
//     config = configProd
// } else {
//     config = configDev
// }
config.isGuestMode = true
