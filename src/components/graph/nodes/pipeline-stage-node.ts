// const { LGraphNode } = require('litegraph.js');
import { LGraphNode } from 'litegraph.js';
// import { LGraphNode, LiteGraph } from 'litegraph.js';

export const pipelineStageNodeType = 'pipeline/stage';

// export type PipelineNodeInput = {
//   pipeline: 
// }
export type PipelineStage = any;
export type Pipeline = PipelineStage[];

// More on nodes: https://github.com/jagenjo/litegraph.js/tree/master/guides
export default class PipelineStageNode extends LGraphNode {
  title = 'Pipeline Stage';
  mouseOver = false;

  // horizontal = true;

  constructor() {
    super();

    this.addInput('', 'array');

    this.addOutput('', 'array');

    // Add some properties.
    this.properties = { precision: 1 };

    // this.shape = LiteGraph.ARROW_SHAPE; // LiteGraph.ARROW_SHAPE;
    // this.shape = LiteGraph.ROUND_SHAPE;

    // this.size = this.computeSize();
  }

  onExecute(): void {
    // Retrieve data from inputs.
    let existingPipeline: Pipeline[];
    if (!this.getInputData(0) || !this.getInputData(0).pipeline) {
      existingPipeline = [];
    } else {
      existingPipeline = this.getInputData(0).pipeline;
    }

    const thisStage = {
      $match: {
        _id: {
          $exists: true
        }
      }
    };

    const pipeline = [
      ...existingPipeline,
      thisStage
    ];

    // Send data to output.
    this.setOutputData(0, {
      complexObject: {
        yes: true,
      },
      pipeline,
      toToolTip: () => 'tooltip',
    });
  }

  // onDrawBackground(actualCtx: HTMLCanvasElement, notCtx: CanvasRenderingContext2D) {
  //   // super();
  //   const ctx = ((actualCtx as any) as CanvasRenderingContext2D);

  //   if((this.flags as any).collapsed) {
  //     return;
  //   }

  //   // ctx.fillStyle = "#555";
  //   // ctx.fillRect(0,0,this.size[0],20);

  //   // if(this.enabled)
  //   // {
  //   //   ctx.fillStyle = "#AFB";
  //   //   ctx.beginPath();
  //   //   ctx.moveTo(this.size[0]-20,0);
  //   //   ctx.lineTo(this.size[0]-25,20);
  //   //   ctx.lineTo(this.size[0],20);
  //   //   ctx.lineTo(this.size[0],0);
  //   //   ctx.fill();
  //   // }

  //   // if(this.visible)
  //   // {
  //   //   ctx.fillStyle = "#ABF";
  //   //   ctx.beginPath();
  //   //   ctx.moveTo(this.size[0]-40,0);
  //   //   ctx.lineTo(this.size[0]-45,20);
  //   //   ctx.lineTo(this.size[0]-25,20);
  //   //   ctx.lineTo(this.size[0]-20,0);
  //   //   ctx.fill();
  //   // }

  //   // ctx.strokeStyle = "#333";
  //   // ctx.beginPath();
  //   // ctx.moveTo(0,20);
  //   // ctx.lineTo(this.size[0]+1,20);
  //   // ctx.moveTo(this.size[0]-20,0);
  //   // ctx.lineTo(this.size[0]-25,20);
  //   // ctx.moveTo(this.size[0]-40,0);
  //   // ctx.lineTo(this.size[0]-45,20);
  //   // ctx.stroke();

  //   ctx.fillStyle = "#ABF";
  //   ctx.strokeStyle = "#333";

  //   ctx.fillRect(0, 0, this.size[0], this.size[1]);
  //   ctx.strokeRect(0, 0, this.size[0], this.size[1]);

  //   if (this.mouseOver) {
  //     ctx.fillStyle = "#AAA";
  //     ctx.fillText( "Example of helper", 0, this.size[1] + 14 );
  //   }
  // }

  // onMouseDown() { // e, pos
  //   alert('clicked node');
  //   // if(pos[1] > 20)
  //   //   return;

  //   // if( pos[0] > this.size[0] - 20)
  //   //   this.enabled = !this.enabled;
  //   // else if( pos[0] > this.size[0] - 40)
  //   //   this.visible = !this.visible;
  // }
}

