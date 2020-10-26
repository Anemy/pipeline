import React from 'react';
// import { Resizable } from 're-resizable';
// const { LiteGraph, LGraphCanvas } = require('litegraph.js');
import { LiteGraph, LGraphCanvas, LLink } from 'litegraph.js';

import PipelineStageNode, { pipelineStageNodeType } from './nodes/pipeline-stage-node';
import DataSourceNode, { dataSourceNodeType } from './nodes/datasource-node';
import LimitStageNode, { limitStageNodeType } from './nodes/limit-stage-node';

import 'litegraph.js/css/litegraph.css';

import './graph.css';

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

class Graph extends React.Component<props> {
  componentDidMount() {
    this.createGraph();
  }

  registerNodesWithLitegraph() {
    // Register our nodes with litegraph.
    LiteGraph.registerNodeType(pipelineStageNodeType, PipelineStageNode);
    LiteGraph.registerNodeType(dataSourceNodeType, DataSourceNode);
    LiteGraph.registerNodeType(limitStageNodeType, LimitStageNode);
  }
  
  createGraph() {
    this.registerNodesWithLitegraph();

    const graph = new LiteGraph.LGraph();

    

    // const canvas = new LGraphCanvas('#mycanvas', graph);
    const canvas = new LGraphCanvas('#mycanvas', graph);
    const oldDrawLinkTooltip = (canvas as any).drawLinkTooltip;
    (canvas as any).drawLinkTooltip = (ctx: CanvasRenderingContext2D, link: LLink) => {
      console.log('draw tooltip!');

      oldDrawLinkTooltip(ctx, link);

      ctx.fillStyle = 'orange';

      const pos = (link as any)._pos;
      ctx.fillRect(pos[0], pos[1], 20, 20);
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

    const dataSource = LiteGraph.createNode(dataSourceNodeType);
    dataSource.pos = [200,200];
    graph.add(dataSource);

    const firstStage = LiteGraph.createNode(pipelineStageNodeType);
    firstStage.pos = [500,200];
    graph.add(firstStage);
    // firstStage.setValue('Data source: db.col');

    const secondStage = LiteGraph.createNode(limitStageNodeType);
    secondStage.pos = [700,200];
    graph.add(secondStage);

    dataSource.connect(0, firstStage, 0);
    firstStage.connect(0, secondStage, 0);

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

export default Graph;
