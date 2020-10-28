import React from 'react';
// const { LiteGraph, LGraphCanvas } = require('litegraph.js');
import { LiteGraph, LGraphCanvas, LLink, Vector4, SerializedLLink } from 'litegraph.js';
import { connect } from 'react-redux';

import PipelineStageNode, { pipelineStageNodeType } from './nodes/pipeline-stage-node';
import DataSourceNode, { dataSourceNodeType } from './nodes/datasource-node';
import LimitStageNode, { limitStageNodeType } from './nodes/limit-stage-node';
import {
  ActionTypes,
  UpdateStoreAction
} from '../../store/actions';
import {
  AppState
} from '../../store/store';

import 'litegraph.js/css/litegraph.css';

import './graph.css';
import Stage, { getNiceStageNameForStageType, STAGES } from '../../models/stage';

// var node_time = LiteGraph.createNode('basic/time');
// graph.add(node_time);

// var node_console = LiteGraph.createNode('basic/console');
// node_console.mode = LiteGraph.ALWAYS;
// graph.add(node_console);

// node_time.connect( 0, node_console, 1 );

// graph.start();

type props = {
  width: number;
  height: number;
}

type StateProps = {
  activeStage: number;
  sampleCount: number;
  stages: Stage[];
};

type DispatchProps = {
  updateStore: (update: any) => void;
};

class Graph extends React.Component<props & StateProps & DispatchProps> {
  componentDidMount() {
    this.createGraph();
  }

  registerNodesWithLitegraph() {
    // Register our nodes with litegraph.
    LiteGraph.registerNodeType(pipelineStageNodeType, PipelineStageNode);
    LiteGraph.registerNodeType(dataSourceNodeType, DataSourceNode);
    LiteGraph.registerNodeType(limitStageNodeType, LimitStageNode);
  }
  
  createGraph = () => {
    const {
      sampleCount,
      stages
    } = this.props;

    this.registerNodesWithLitegraph();

    const graph = new LiteGraph.LGraph();

    // const canvas = new LGraphCanvas('#mycanvas', graph);
    const canvas = new LGraphCanvas('#mycanvas', graph);

    canvas.onDrawBackground = (ctx: CanvasRenderingContext2D, visible_area: Vector4) => {
      const {
        width,
        height
      } = this.props;

      // console.log('draw bg');
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(visible_area[0], visible_area[1], visible_area[2], visible_area[3]);

      // Highlight lines.
      const lineSeperation = 20;
      const lineThickness = 0.5;
      ctx.strokeStyle = '#eeeeee';



      for (let i = 0; i < width; i += lineSeperation) {
        ctx.strokeRect(i, 0, lineThickness, height);
      }
      for (let i = 0; i < height; i += lineSeperation) {
        ctx.strokeRect(0, i, width, lineThickness);
      }
      // for (let i = visible_area[0]; i < visible_area[2]; i += lineSeperation) {
      //   ctx.strokeRect(i, 0, lineThickness, visible_area[3]);
      // }
      // for (let i = visible_area[1]; i < visible_area[3]; i += lineSeperation) {
      //   ctx.strokeRect(0, i, visible_area[2], lineThickness);
      // }
    };

    const oldDrawLinkTooltip = (canvas as any).drawLinkTooltip;
    (canvas as any).drawLinkTooltip = (ctx: CanvasRenderingContext2D, link: LLink) => {
      oldDrawLinkTooltip(ctx, link);

      ctx.fillStyle = '#f5f5f5';
      ctx.strokeStyle = 'black';

      const pos = (link as any)._pos;
      ctx.fillRect(pos[0], pos[1], 20, 20);

      // link.data.pipeline
      // console.log(' link.data', link.data);

      const text = JSON.stringify((link as any).data.pipeline, null, 2); // .pipeline
      const textLines = text.split('\n');

      ctx.shadowColor = 'black';
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.shadowBlur = 3;
      ctx.font = '14px Courier New';
      let textHeight = 0;
      let textWidth = 0;
      for (const textLine of textLines) {
        const textMeasurements = ctx.measureText(textLine);
        if (textMeasurements.width > textWidth) {
          textWidth = textMeasurements.width;
        }
        textHeight += textMeasurements.actualBoundingBoxDescent + textMeasurements.actualBoundingBoxAscent + 2;
      }
      // const textMeasurements = ctx.measureText(text);
      // const textHeightMaybe = textMeasurements.actualBoundingBoxDescent + textMeasurements.actualBoundingBoxAscent;

      // console.log('textHeightMaybe', textHeightMaybe);
      // console.log('textMeasurements', textMeasurements);
      const padding = 30;
      const halfPadding = padding / 2;
      ctx.strokeRect(pos[0], pos[1], textWidth + padding, textHeight + padding);
      ctx.fillRect(pos[0], pos[1], textWidth + padding, textHeight + padding)

      ctx.shadowColor = 'transparent';
      // ctx.textAlign = 'left';
      ctx.fillStyle = '#232323';
      
      let heightOffset = 0;
      for (const textLine of textLines) {
        const textMeasurements = ctx.measureText(textLine);
        ctx.fillText(textLine, pos[0] + halfPadding, pos[1] + 10 + halfPadding + heightOffset);

        heightOffset += textMeasurements.actualBoundingBoxDescent + textMeasurements.actualBoundingBoxAscent + 2;
      }
    };

    // const node_const = LiteGraph.createNode('basic/string');
    // node_const.pos = [200,200];
    // graph.add(node_const);
    // node_const.setValue('Data source: db.col');

    // const node_watch = LiteGraph.createNode('basic/watch');
    // node_watch.pos = [700,200];
    // graph.add(node_watch);

    // node_const.connect(0, node_watch, 0 );

    // // https://github.com/jagenjo/litegraph.js/blob/master/src/nodes/input.js
    // const gamepageNode = LiteGraph.createNode('input/gamepad');
    // gamepageNode.pos = [500,500];
    // graph.add(gamepageNode);

    const dataSource: DataSourceNode = LiteGraph.createNode(dataSourceNodeType);
    dataSource.pos = [150,200];
    dataSource.setSampleSize(sampleCount);
    graph.add(dataSource);

    const startX = 450;
    let x = startX;
    let lastStageNode;
    for (const stage of stages) {
      if (stage.type === STAGES.DATA_SOURCE) {
        continue;
      }
      const newStageNode: PipelineStageNode = LiteGraph.createNode(pipelineStageNodeType);
      newStageNode.title = getNiceStageNameForStageType(stage.type);
      newStageNode.pos = [x, 200];
      newStageNode.pipeline = stage.getPipelineFromStage();

      if (x === startX) {
        dataSource.connect(0, newStageNode, 0);
      } else {
        lastStageNode?.connect(0, newStageNode, 0);
      }

      x += 200;
      lastStageNode = newStageNode;
      graph.add(newStageNode);
    }

    // const firstStage = LiteGraph.createNode(pipelineStageNodeType);
    // firstStage.pos = [500,200];
    // graph.add(firstStage);
    // // firstStage.setValue('Data source: db.col');

    // const secondStage = LiteGraph.createNode(limitStageNodeType);
    // secondStage.pos = [700,200];
    // graph.add(secondStage);

    // dataSource.connect(0, firstStage, 0);
    // firstStage.connect(0, secondStage, 0);

    graph.start();
  }

  render() {
    const {
      width,
      height
    } = this.props;

    return (
      <canvas
        className="graph-canvas"
        id="mycanvas"
        width={width - 20}
        height={height - 40}
      />
    );
  }
}


const mapStateToProps = (state: AppState): StateProps => {
  return {
    activeStage: state.activeStage,
    sampleCount: state.sampleCount,
    stages: state.stages
  };
};

const mapDispatchToProps: DispatchProps = {
  // Resets URL validation if form was changed.
  updateStore: (update: any): UpdateStoreAction => ({
    type: ActionTypes.UPDATE_STORE,
    update
  })
};

export default connect(mapStateToProps, mapDispatchToProps)(Graph);
