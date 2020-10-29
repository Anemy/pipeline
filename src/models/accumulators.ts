// TODO: Pull from https://github.com/mongodb-js/vscode-mongodb-language/blob/master/syntaxes/mongodb-symbols.json

export enum ACCUMULATORS {
  ADD_TO_SET = '$addToSet',
  AVG = '$avg',
  FIRST = '$first',
  LAST = '$last',
  MAX = '$max',
  MIN = '$min',
  PUSH = '$push',
  STD_DEV_POP = '$stdDevPop',
  STD_DEV_SAMP = '$stdDevSamp',
  SUM = '$sum',
  COUNT ='$sum'
}

export interface AggAccumulator {
  accumulator: ACCUMULATORS;
  displayName: string;

  buildAccumulatorWithMeasure: (measure: string) => any
}

const AddToSetAccumulator = {
  accumulator: ACCUMULATORS.ADD_TO_SET,
  displayName: 'Distinct Values',
  buildAccumulatorWithMeasure: (measure: string) => {
    if (!measure || measure.length === 0) {
      return 1;
    }

    // TODO: We could allow more measures here, like multiplying or adding inside...
    return `$${measure}`;
  }
};
const AvgAccumulator = {
  accumulator: ACCUMULATORS.AVG,
  displayName: 'Average',
  buildAccumulatorWithMeasure: (measure: string) => {
    if (!measure || measure.length === 0) {
      // This should probably error...
      return 1;
    }

    return `$${measure}`;
  }
};
const FirstAccumulator = {
  accumulator: ACCUMULATORS.FIRST,
  displayName: 'First Value',
  buildAccumulatorWithMeasure: (measure: string) => {
    if (!measure || measure.length === 0) {
      // This should probably error...
      return 1;
    }

    return `$${measure}`;
  }
};
const LastAccumulator = {
  accumulator: ACCUMULATORS.LAST,
  displayName: 'Last Value',
  buildAccumulatorWithMeasure: (measure: string) => {
    if (!measure || measure.length === 0) {
      // This should probably error...
      return 1;
    }

    return `$${measure}`;
  }
};
const MaxAccumulator = {
  accumulator: ACCUMULATORS.MAX,
  displayName: 'Maximum',
  buildAccumulatorWithMeasure: (measure: string) => {
    if (!measure || measure.length === 0) {
      // This should probably error...
      return 1;
    }

    return `$${measure}`;
  }
};
const MinAccumulator = {
  accumulator: ACCUMULATORS.MIN,
  displayName: 'Minimum',
  buildAccumulatorWithMeasure: (measure: string) => {
    if (!measure || measure.length === 0) {
      // This should probably error...
      return 1;
    }

    return `$${measure}`;
  }
};
const PushAccumulator = {
  accumulator: ACCUMULATORS.PUSH,
  displayName: 'All Values',
  buildAccumulatorWithMeasure: (measure: string) => {
    if (!measure || measure.length === 0) {
      // This should probably error...
      return 1;
    }

    return `$${measure}`;
  }
};
const StdDevPopAccumulator = {
  accumulator: ACCUMULATORS.STD_DEV_POP,
  displayName: 'Standard Deviation (Population)',
  buildAccumulatorWithMeasure: (measure: string) => {
    if (!measure || measure.length === 0) {
      // This should probably error...
      return 1;
    }

    return `$${measure}`;
  }
};
const StdDevSampAccumulator = {
  accumulator: ACCUMULATORS.STD_DEV_SAMP,
  displayName: 'Standard Deviation (Sample)',
  buildAccumulatorWithMeasure: (measure: string) => {
    if (!measure || measure.length === 0) {
      // This should probably error...
      return 1;
    }

    return `$${measure}`;
  }
};
const CountAccumulator = {
  accumulator: ACCUMULATORS.COUNT,
  displayName: 'Count',
  buildAccumulatorWithMeasure: (measure: string) => {

    return 1;
  }
};
const SumAccumulator = {
  accumulator: ACCUMULATORS.SUM,
  displayName: 'Sum',
  buildAccumulatorWithMeasure: (measure: string) => {
    if (!measure || measure.length === 0) {
      // Just count the group by docs when there's no measure.
      return 1;
    }

    // TODO: We could allow more measures here, like multiplying or adding inside...
    return `$${measure}`;
  }
};

export const getAccumulator = (accumulator: ACCUMULATORS): AggAccumulator => {
  switch (accumulator) {
    case ACCUMULATORS.ADD_TO_SET:
      return AddToSetAccumulator;
    case ACCUMULATORS.AVG:
      return AvgAccumulator;
    case ACCUMULATORS.FIRST:
      return FirstAccumulator;
    case ACCUMULATORS.LAST:
      return LastAccumulator;
    case ACCUMULATORS.MAX:
      return MaxAccumulator;
    case ACCUMULATORS.MIN:
      return MinAccumulator;
    case ACCUMULATORS.PUSH:
      return PushAccumulator;
    case ACCUMULATORS.STD_DEV_POP:
      return StdDevPopAccumulator;
    case ACCUMULATORS.STD_DEV_SAMP:
      return StdDevSampAccumulator;
    case ACCUMULATORS.SUM:
      return SumAccumulator;
    case ACCUMULATORS.COUNT:
      return CountAccumulator;
    default:
      throw new Error(`Accumulator not found '${accumulator}'`);
  }
}

// const accumulatorList: AggAccumulator[] = [];
// for (const accumulator in ACCUMULATORS) {
//   accumulatorList.push(getAccumulator(accumulator));
// }
export const aggAccumulators: AggAccumulator[] = [
  AvgAccumulator,
  SumAccumulator,
  MinAccumulator,
  MaxAccumulator,
  CountAccumulator,
  AddToSetAccumulator,
  PushAccumulator,
  FirstAccumulator,
  LastAccumulator,
  StdDevPopAccumulator,
  StdDevSampAccumulator
];

// export const aggAcumulators = Object.keys(ACCUMULATORS).map(
//   accumulator => getAccumulator(ACCUMULATORS[accumulator as any])
// );
