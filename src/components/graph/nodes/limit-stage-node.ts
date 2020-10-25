// const { LGraphNode } = require('litegraph.js');
// import { LGraphNode } from 'litegraph.js';

import PipelineStageNode from './pipeline-stage-node';

export const limitStageNodeType = 'pipeline/limit-stage';

const DEFAULT_LIMIT = 20;

// More on nodes: https://github.com/jagenjo/litegraph.js/tree/master/guides
export default class LimitStageNode extends PipelineStageNode {
  title = 'Limit Stage';

  numberWidget: any;

  constructor() {
    super();

    // this.addOutput('Output', 'array');
    // this.addOutput('', 'array');

    // Add some properties.
    this.properties = {
      limitAmount: DEFAULT_LIMIT
    };

    this.addWidget(
      'number',
      'Documents',
      25,
      (v) => {
        console.log('widget value change', v);
        this.properties.limitAmount = v;
      }, {
        min: 1,
        max: 10,
        step: 1
      }
    );

    // this.addWidget('button', 'Log', null, () => {
    //   console.log(this.properties);
    // });

    // this.numberWidget = this.addWidget(
    //   'string',
    //   'Limit',
    //   `${this.properties.limitAmount}`,
    //   (v) => {
    //     let parsedNumber = Number(v);
    //     // Only update limit when good number provided.
    //     if (!isNaN(parsedNumber)) {
    //       parsedNumber = Math.floor(parsedNumber);
    //       parsedNumber = Math.max(1, parsedNumber);

    //       this.properties.limitAmount = parsedNumber;
    //     }
    //     console.log('widget value change', parsedNumber);
    //   }, {
    //     min: 1,
    //     max: 100,
    //     step: 1
    //   }
    // );

    // color: string;
    // bgcolor: string;
    // boxcolor: string;
    // this.color = 'white';
    // this.bgcolor = 'green';
    // this.boxcolor = 'black';
  }
}

