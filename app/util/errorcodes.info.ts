export enum ErrorCode {
  TABLE_NOT_FOUND,
  INT_NOT_FOUND,
  NO_UNIQUE_VALUES,

  INVALID_NUMBER_OF_TICKS,
  INVALID_NUMBER_OF_SAMPLE_PTS,

  NO_INTERVENTION_TYPES,
  NO_INTERVENTION_OF_TYPE,
  NO_DATA_FOR_STUDY
}

export interface ErrorInfo {
  code: ErrorCode;
}

export function format(error: ErrorInfo): {status: number, msg: string} {
  let err: any = error;
  if (err.errmsg) {
    return {
      status: 500,
      msg: err.errmsg,
    };
  }
  switch (error.code) {
  case ErrorCode.INT_NOT_FOUND:
    return {
      status: 404,
      msg: 'Couldn\'t find key for ' + err.i,
    };
  case ErrorCode.NO_INTERVENTION_TYPES:
    return {
      status: 404,
      msg: 'No intervention types for table ' + err.table,
    };
  case ErrorCode.NO_INTERVENTION_OF_TYPE:
    return {
      status: 404,
      msg: 'It seems like ' + err.table + ' doesn\'t contain data for ' + err.key + ' intervention'
    };
  case ErrorCode.NO_DATA_FOR_STUDY:
    return {
      status: 404,
      msg: 'No data in ' + err.table + ' table for filters ' + JSON.stringify(err.filters),
    };
  case ErrorCode.TABLE_NOT_FOUND:
    return {
      status: 404,
      msg: 'Table ' + err.table + ' not found!',
    };
  case ErrorCode.INVALID_NUMBER_OF_SAMPLE_PTS:
    return {
      status: 400,
      msg: 'Invalid number of sample points'
    };
  case ErrorCode.INVALID_NUMBER_OF_TICKS:
    return {
      status: 400,
      msg: 'Invalid number of ticks'
    };
  case ErrorCode.NO_UNIQUE_VALUES:
    return {
      status: 404,
      msg: 'There are no unique values in column ' + err.col,
    };
  }
  return {
    status: 500,
    msg: 'Unknown error occurred: ' + error,
  };
}
