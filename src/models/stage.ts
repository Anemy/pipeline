
export enum STAGES {
  FILTER = 'FILTER',
  LIMIT = 'LIMIT',
  PROJECT = 'PROJECT'
}

export class Stage {
  type: STAGES;
  content: string = '';

  constructor(stageType: STAGES) {
    this.type = stageType;
  }
}

export default Stage;
