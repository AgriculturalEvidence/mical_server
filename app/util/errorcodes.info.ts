export enum ErrorCode {
  TABLE_NOT_FOUND,
  INT_NOT_FOUND,

  YIELD_NO_INTERVENTION_TYPES,
  YIELD_NO_INTERVENTION_OF_TYPE,
  YIELD_NO_DATA_FOR_STUDY
}

export interface ErrorInfo {
  code: ErrorCode;
}

export function format(error: ErrorInfo): {status: number, msg: string} {
  let err: any = error;
  switch (error.code) {
    case ErrorCode.INT_NOT_FOUND:
      return {
        status: 404,
        msg: "Couldn't find key for " + err.i,
      };
    case ErrorCode.YIELD_NO_INTERVENTION_TYPES:
      return {
        status: 404,
        msg: "No intervention types for yield"
      }
    case ErrorCode.YIELD_NO_INTERVENTION_OF_TYPE:
      return {
        status: 404,
        msg: "It seems like yield doesn\'t contain data for " + err.key + " intervention"
      }
    case ErrorCode.YIELD_NO_DATA_FOR_STUDY:
      return {
        status: 404,
        msg: "No data in yield table for filters " + JSON.stringify(err.filters),
      }
    case ErrorCode.TABLE_NOT_FOUND:
      return {
        status: 404,
        msg: "Table " + err.table + " not found!",
      }
  }
  return {
    status: 500,
    msg: "Unknown error occurred: " + error,
  };
}
