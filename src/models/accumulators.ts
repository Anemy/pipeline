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
  SUM = '$sum'
}

export interface AggAccumulator {
  accumulator: ACCUMULATORS;
  displayName: string;

  buildAccumulatorWithMeasure: (measure: string) => any
}

const AddToSetAccumulator = {
  accumulator: ACCUMULATORS.ADD_TO_SET,
  displayName: 'add to set',
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
  displayName: 'average',
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
  displayName: 'first',
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
  displayName: 'last',
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
  displayName: 'max',
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
  displayName: 'min',
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
  displayName: 'add to array',
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
  displayName: 'standard deviation population',
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
  displayName: 'standard deviation sample',
  buildAccumulatorWithMeasure: (measure: string) => {
    if (!measure || measure.length === 0) {
      // This should probably error...
      return 1;
    }

    return `$${measure}`;
  }
};
const SumAccumulator = {
  accumulator: ACCUMULATORS.SUM,
  displayName: 'sum',
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
    default:
      throw new Error(`Accumulator not found '${accumulator}'`);
  }
}

// const accumulatorList: AggAccumulator[] = [];
// for (const accumulator in ACCUMULATORS) {
//   accumulatorList.push(getAccumulator(accumulator));
// }
export const aggAccumulators: AggAccumulator[] = [
  AddToSetAccumulator,
  AvgAccumulator,
  FirstAccumulator,
  LastAccumulator,
  MaxAccumulator,
  MinAccumulator,
  PushAccumulator,
  StdDevPopAccumulator,
  StdDevSampAccumulator,
  SumAccumulator
];

// export const aggAcumulators = Object.keys(ACCUMULATORS).map(
//   accumulator => getAccumulator(ACCUMULATORS[accumulator as any])
// );
