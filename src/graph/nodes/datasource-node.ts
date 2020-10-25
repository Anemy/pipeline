// const { LGraphNode } = require('litegraph.js');
import { LGraphNode } from 'litegraph.js';

import { Pipeline } from './pipeline-stage-node';

export const dataSourceNodeType = 'pipeline/data-source';

// More on nodes: https://github.com/jagenjo/litegraph.js/tree/master/guides
export default class DataSourceNode extends LGraphNode {
  title = 'Data Source';
  static title_color = 'green';

  // horizontal = true;

  constructor() {
    super();

    // this.addOutput('Output', 'array');
    this.addOutput('', 'array');

    // Add some properties.
    this.properties = { sampleSize: 20 };

    // color: string;
    // bgcolor: string;
    // boxcolor: string;
    this.color = 'white';
    this.bgcolor = 'green';
    this.boxcolor = 'black';
  }

  onExecute(): void {
    // Retrieve data from inputs.
    // const existingPipeline = this.getInputData(0);

    const pipeline: Pipeline = [];

    // Send data to output.
    this.setOutputData(0, {
      complexObject: {
        yes: true,
      },
      pipeline,
      toToolTip: () => 'A useful description',
    });
  }
}

