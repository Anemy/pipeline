
export default function getSetup(canvasWidth: number, canvasHeight: number, p5: p5, canvasParentRef: Element) {
  let palettes = [{
    ocean: '#0B3B35', // #0B3B35 // rgb(11, 59, 53) // rgba(11, 59, 53, 0.5)
    sky: '#f5f5f5',
    under: '#116149', // 'rgba(11, 59, 53, 150)', // under: '#116149',
    above: '#13AA52', // rgba(11, 59, 53, 0.5) // 13AA52
    drawUnder: Math.random() > 0.5
  }];

  let MIN_SOOT_COUNT = 50;
  let MAX_SOOT_COUNT = 300;

  function drawSoot(x: number, y: number, width: number, height: number, scale: number, alwaysWhiteSoot: boolean) {
    let SOOT_COLOR = p5.color(255, 255, 255, 190);

    if (!alwaysWhiteSoot && Math.random() > 0.4) {
      let soooooot = Math.floor(Math.random() * 150);
      SOOT_COLOR = p5.color(soooooot, soooooot, soooooot + 10);
    }

    let MIN_SOOT_SIZE = (width / 2000) * scale;
    let MAX_SOOT_SIZE = (width / 300) * scale;

    let amountOfSoot = Math.floor(MIN_SOOT_COUNT + (Math.random() * (MAX_SOOT_COUNT - MIN_SOOT_COUNT)));

    for (let i = 0; i < amountOfSoot; i++) {
      let SOOT_SIZE = MIN_SOOT_SIZE + (Math.random() * (MAX_SOOT_SIZE - MIN_SOOT_SIZE));

      p5.noStroke();
      p5.fill(SOOT_COLOR);
      let xPos = x + Math.floor(SOOT_SIZE + (Math.random() * (width - SOOT_SIZE)));
      let yPos = y + Math.floor(SOOT_SIZE + (Math.random() * (height - SOOT_SIZE)));
      p5.ellipse(xPos, yPos, SOOT_SIZE, SOOT_SIZE);
    }
  }

  let mainPalette = palettes[Math.floor(Math.random() * palettes.length)];

  function setup(onClickSketch: () => void) {
    let palette = mainPalette;

    p5.createCanvas(
      canvasWidth,
      canvasHeight
    ).parent(
      canvasParentRef
    ).mouseClicked(onClickSketch);

    // createCanvas(canvasWidth, canvasHeight);
    // console.log('draw', canvasWidth, canvasHeight);
    p5.background(palette.sky);

    sola(canvasWidth, canvasHeight);

    p5.fill(255, 255, 255, 255 * Math.random() * Math.random());
    p5.rect(0, 0, canvasWidth, canvasHeight);

    let maxSootTimes = 6 + Math.floor(Math.random() * 10);
    for (let i = 0; i < maxSootTimes; i++) {
      if (Math.random() > 0.4) {
        drawSoot(0, 0, canvasWidth, canvasHeight, 0.1 + Math.random() * 0.4, Math.random() > 0.9);
      }
    }

    let waterHeight = (canvasHeight * 0.15) + ((canvasHeight * Math.random() * Math.random()) * (0.6));

    p5.noStroke();
    p5.fill(palette.ocean);
    p5.rect(0, canvasHeight - waterHeight, canvasWidth, waterHeight);

    let bergs = Math.random() > 0.2 ? 1 + Math.floor(Math.random() * 200) : 1;
    let furthestUpY = 0;

    let depthLayers = 200;

    let hasStroke = false;//  Math.random() > 0.9;

    let waterClarity = Math.random() > 0.2 ? 1 : Math.random() * 2;

    for (let i = 0; i < bergs; i++) {

      let bergSizeX = (canvasWidth / 50) + (Math.random() * (canvasWidth * (46 / 50)));
      let bergSizeY = (canvasHeight / 40) + (Math.random() * (canvasHeight * 0.4));

      let bergOffsetAmountX = (canvasWidth / 3) * Math.random();

      let bergOffsetX = bergOffsetAmountX * (Math.random() > 0.5 ? -1 : 1);

      let bergOffsetY = (canvasHeight / 10) * Math.random();

      let bergX = (canvasWidth / 2) + bergOffsetX + (-bergSizeX / 2);
      let bergY = (canvasHeight - waterHeight) + bergOffsetY + (-bergSizeY);

      if (bergY + bergSizeY < furthestUpY) {
        continue;
      } else if (bergY + bergSizeY > furthestUpY) {
        furthestUpY = bergY + bergSizeY;
      }

      let chanceForVertChange = Math.random();
      let changeToLevel = Math.random() > 0.5 ? Math.random() : 0;
      let maxCutoutSizeY = Math.random() > 0.5 ? 0 : Math.random() * bergSizeY;

      let vertMomentum = 0;
      let underVertMomentum = 0;
      let vertMomentumChangeChange = Math.random() * Math.random() * Math.random() * bergSizeY;
      let minCutoutSize = bergSizeX / 60;
      let maxCutoutSize = bergSizeX / 20;
      let uniformCutout = Math.random() > 0.7;
      let uniformCutoutSize = bergSizeX / (2 + Math.floor(Math.random() * 300));

      let currentX = bergX;

      let lastCurrentXAboveWater = currentX;

      let currentSizeY = Math.random() > 0.4 ? Math.random() * bergSizeY : bergSizeY;
      let underSizeY = Math.random() > 0.4 ? Math.random() * bergSizeY : bergSizeY;
      let lastY = bergY + bergSizeY;
      let lastUnderY = bergY + bergSizeY;
      // Updated VVVVV
      let lastUnderTotalY = 0; // currentUnderY + underSizeY * 1.5 + bergSizeY * 0.6;
      let weGoing = true;
      let isFirst = true;
      let trueSizeY = underSizeY;
      let haventGoneUnder = false;
      p5.beginShape();
      let justWentUnder = false;

      while (weGoing) {
        let cutoutSizeX = minCutoutSize + (Math.random() * (maxCutoutSize - minCutoutSize));
        if (uniformCutout) {
          cutoutSizeX = uniformCutoutSize;
        }

        cutoutSizeX = Math.min((bergX + bergSizeX) - currentX, cutoutSizeX);

        let currentY = (bergY + bergSizeY) - currentSizeY;

        p5.noStroke();
        p5.fill(palette.above);

        let underShift = (currentSizeY <= 0 || currentY === bergY + bergSizeY) ? Math.min((bergSizeY * 0.5), -trueSizeY * 0.25) : 0;
        underShift = Math.max(0, underShift);
        p5.fill(palette.under);
        let currentUnderY = bergY + bergSizeY + underShift;
        let currentUnderTotalY = currentUnderY + underSizeY * 1.5 + bergSizeY * 0.6;
        if (palette.drawUnder) {
          if (!hasStroke) {
            p5.noStroke();
          }

          if (isFirst) {
            p5.rect(currentX - 1, currentUnderY, cutoutSizeX + 2, underSizeY * 1.5 + bergSizeY * 0.6);
          }
          if (currentX + cutoutSizeX + 1 < bergX + bergSizeX) {
            p5.rect(currentX, currentUnderY, cutoutSizeX + 1, underSizeY * 1.5 + bergSizeY * 0.6);
          }
        }
        p5.noFill();

        p5.stroke(palette.ocean);

        if (palette.drawUnder) {
          if (!hasStroke) {
            p5.noStroke();
          }
          if (underShift > 0) {
            p5.line(currentX, currentUnderY, currentX + cutoutSizeX + 1, currentUnderY);
          }
          p5.line(currentX, currentUnderTotalY, currentX + cutoutSizeX + 1, currentUnderTotalY);

          if (isFirst) {
            p5.line(currentX - 2, currentUnderY, currentX, currentUnderTotalY);
          }

          if (lastUnderY !== currentUnderY) {
            p5.line(currentX, lastUnderY, currentX, currentUnderY);
          }

          if (lastUnderTotalY !== currentUnderTotalY) {
            // This was always true maybe - NAN comparison?
            p5.line(currentX, lastUnderTotalY, currentX, currentUnderTotalY);
          }
        }

        if (isFirst) {
          isFirst = false;

          let startY = bergY + bergSizeY;
          p5.curveVertex(currentX - 1, startY);
          p5.curveVertex(currentX - 1, startY);
          p5.curveVertex(currentX - 3, startY - ((startY - currentY) * (15 / 20)));
          p5.curveVertex(currentX - 3.5, startY - ((startY - currentY) * (19 / 20)));
        }

        if (underShift === 0 && currentY !== bergY + bergSizeY) {
          if (justWentUnder) {
            justWentUnder = false;
            p5.beginShape();
            let startY = bergY + bergSizeY;
            p5.curveVertex(currentX, startY);
            p5.curveVertex(currentX, startY);
            p5.curveVertex(currentX, startY + ((startY - currentY) / 20));
            p5.curveVertex(currentX, startY + ((startY - currentY) / 5));
          }

          p5.curveVertex(currentX, currentY);
          lastCurrentXAboveWater = currentX;
          haventGoneUnder = true;
        } else if (haventGoneUnder) {
          justWentUnder = true;
          haventGoneUnder = false;

          p5.curveVertex(lastCurrentXAboveWater + 1, lastY + (((bergY + bergSizeY) - lastY) / 20));
          p5.curveVertex(lastCurrentXAboveWater + 1, lastY + (((bergY + bergSizeY) - lastY) / 5));
          p5.curveVertex(lastCurrentXAboveWater + 1, bergY + bergSizeY);
          p5.curveVertex(lastCurrentXAboveWater + 1, bergY + bergSizeY);

          p5.fill(palette.above);
          if (!hasStroke) {
            p5.noStroke();
          }

          p5.endShape();
          p5.stroke(palette.ocean);
        }

        lastY = (bergY + bergSizeY) - currentSizeY;
        lastUnderY = currentUnderY;
        lastUnderTotalY = currentUnderTotalY;

        if (currentX + cutoutSizeX + 1 > bergX + bergSizeX) {

          if (palette.drawUnder) {
            p5.line(currentX + cutoutSizeX + 1, currentUnderY, currentX + cutoutSizeX + 1, currentUnderTotalY);
          }
          weGoing = false;
          break;
        }

        currentX += cutoutSizeX;
        underSizeY += underVertMomentum;
        underSizeY = Math.max(maxCutoutSizeY, underSizeY);
        underSizeY = Math.min(underSizeY, bergSizeY * 1.5);

        currentSizeY += vertMomentum;
        trueSizeY += vertMomentum;

        trueSizeY = Math.min(trueSizeY, bergSizeY);
        currentSizeY = Math.max(maxCutoutSizeY, currentSizeY);
        currentSizeY = Math.min(currentSizeY, bergSizeY);

        if (Math.random() < chanceForVertChange) {
          vertMomentum += vertMomentumChangeChange * (Math.random() > 0.5 ? 1 : -1);
        }

        if (Math.random() < chanceForVertChange) {
          underVertMomentum += vertMomentumChangeChange * (Math.random() > 0.5 ? 1 : -1);
        }

        if (Math.random() < changeToLevel) {
          vertMomentum = 0;
        }

        if (Math.random() < changeToLevel) {
          underVertMomentum = 0;
        }
      }
      p5.fill(palette.above);
      p5.curveVertex(lastCurrentXAboveWater + 3, lastY + (((bergY + bergSizeY) - lastY) / 20));
      p5.curveVertex(lastCurrentXAboveWater + 3, lastY + (((bergY + bergSizeY) - lastY) / 5));

      p5.curveVertex(lastCurrentXAboveWater + 1, bergY + bergSizeY);
      p5.curveVertex(lastCurrentXAboveWater + 1, bergY + bergSizeY);
      if (!hasStroke) {
        p5.noStroke();
      }
      p5.endShape();

      // What does this do.
      p5.noStroke();
      p5.fill(p5.color(0, 0, 0, 3));
      p5.rect(0, 0, canvasWidth, canvasHeight);

      if (palette.drawUnder) {
        for (let m = 0; m < depthLayers; m++) {
          p5.noStroke();
          let depthColor = p5.color(palette.ocean);
          depthColor.setAlpha(255 - (((m / depthLayers) * waterClarity * ((m / depthLayers))) * 255));
          p5.fill(depthColor);
          let depthH = (canvasHeight - (bergY + bergSizeY)); // depthLayers
          p5.rect(0, bergY + bergSizeY + (depthH - (depthH * (m / depthLayers))), canvasWidth, (depthH * (m / depthLayers)) + 1);
        }
      }
    }

    for (let i = 0; i < maxSootTimes * (4 * Math.random()); i++) {
      if (Math.random() > 0.4) {
        drawSoot(0, 0, canvasWidth, canvasHeight, 0.1 + Math.random() * 0.28, Math.random() < 0.98);
      }
    }
  }

  let minFlow = canvasWidth / 40; // width / 4;
  let maxFlow = canvasWidth / 2;// width * 3;
  let flowAmount = minFlow + (Math.random() * Math.random() * (maxFlow - minFlow));

  let connectorsAmountMultiplier = Math.random();
  function drawHood(width: number, height: number, pallete: any, thinStrokeWidth: number, thiccStrokeWidth: number, rays: number, angleFromSun: number) {
    // let noiseScale = 0.006;
    let noiseScale = 0.007;

    let noiseOffsetX = Math.random() * 2000;
    let noiseOffsetY = Math.random() * 2000;

    let connectors = Math.floor((rays / 25) + (connectorsAmountMultiplier * 3 * (rays / 8) * (width / 400)));

    // let connectors = minLines + Math.floor(Math.random() * (maxLines - minLines));
    let radius = Math.min(width, height) / 4;

    let xMove = flowAmount * Math.cos(angleFromSun);
    let yMove = flowAmount * Math.sin(angleFromSun);

    p5.stroke(pallete.stroke);

    let thiccFlag = true;

    for (let i = 0; i < connectors; i++) {
      let theColor = 2 * Math.floor(255 * (i / connectors));
      if (thiccFlag) {
        thiccFlag = false;
        p5.strokeWeight(thinStrokeWidth / 2);
      } else {
        thiccFlag = true;
        p5.strokeWeight(thiccStrokeWidth / 2);
      }
      if (i >= connectors / 2) {
        // theColor = 125;
        theColor = 255 - (theColor - 255);
      }
      let x = (width / 2) + (radius * (Math.cos(Math.PI * 2 * (i / connectors))));
      let y = (height / 2) + (radius * (Math.sin(Math.PI * 2 * (i / connectors))));

      let cy1Base = y;
      let cx1 = x + (xMove * (1 / 3));
      let cy1 = cy1Base + (yMove * (1 / 3));

      let c2Intensity = flowAmount * p5.noise((cx1 + noiseOffsetX) * noiseScale, (cy1 + noiseOffsetY) * noiseScale, 1 * noiseScale);
      let c2Dir = (2 * Math.PI * p5.noise(((cx1 + noiseOffsetX) + (width * 2)) * noiseScale, ((cy1 + noiseOffsetY) + (height * 2)) * noiseScale, 1 * noiseScale));
      let c2XPush = (Math.cos(c2Dir) * (c2Intensity * 0.2));
      let cx2 = cx1 + c2XPush + (xMove / 3);
      let c2YPush = (Math.sin(c2Dir) * (c2Intensity * 0.2));
      let cy2 = cy1 + c2YPush + (yMove / 3);

      let finalIntensity = flowAmount * p5.noise((cx2 + noiseOffsetX) * noiseScale, (cy2 + noiseOffsetY) * noiseScale, 1 * noiseScale);
      let finalDir = (2 * Math.PI * p5.noise(((cx2 + noiseOffsetX) + (width * 2)) * noiseScale, ((cy2 + noiseOffsetY) + (height * 2)) * noiseScale, 1 * noiseScale));
      let xFinalPush = (Math.cos(finalDir) * (finalIntensity * 0.2));
      let finalX = cx2 + xFinalPush + (xMove / 3);
      let yFinalPush = (Math.sin(finalDir) * (finalIntensity * 0.2));
      let finalY = cy2 + yFinalPush + (yMove / 3);

      p5.bezier(x, y, cx1, cy1, cx2, cy2, finalX, finalY);
    }
  }

  function getAngleBetweenTwoPoints(x1: number, y1: number, x2: number, y2: number) {
    let dx = x2 - x1;
    // Minus to correct for coord re-mapping
    let dy = -(y2 - y1);

    let angle = Math.atan2(dy, dx);

    // We need to map to coord system when 0 degree is at 3 O'clock, 270 at 12 O'clock
    if (angle < 0) {
      angle = Math.abs(angle);
    } else {
      angle = 2 * Math.PI - angle;
    }
    angle = 2 * Math.PI - angle;

    return angle;
  }

  function sola(width: number, height: number) {
    p5.noFill();
    p5.strokeWeight(0.5);

    // palettes[Math.floor(Math.random() * palettes.length)];
    let strokeColorForHere = Math.random() > 0.5 ? mainPalette.under : mainPalette.above;
    strokeColorForHere = Math.random() > 0.3333 ? strokeColorForHere : mainPalette.ocean;
    let pallete = {
      background: mainPalette.sky,
      stroke: strokeColorForHere,
      colors: [mainPalette.ocean, mainPalette.sky, mainPalette.under, mainPalette.above]
    };

    let allBlack = Math.random() > 0.95;
    if (allBlack) {
      pallete = {
        background: 'black',
        stroke: 'black',
        colors: ['black', 'black', 'black']
      };
    }

    // Only background sometimes.
    if (Math.random() > 0.5 && !allBlack) {
      p5.fill(pallete.background);
      p5.noStroke();
      p5.rect(0, 0, width, height);
    }

    let onlyWhiteSootssss = Math.random() > 0.9;

    for (let i = 0; i < 6; i++) {
      if (Math.random() > 0.4) {
        drawSoot(0, 0, width, height, 0.05 + Math.random() * 0.4, onlyWhiteSootssss);
      }
    }

    let suns = [];
    // let amountOfSuns = 1;
    let amountOfSuns = Math.floor(Math.random() * 20);
    for (let i = 0; i < amountOfSuns; i++) {
      let x = Math.random() * width;
      let y = Math.random() * height;
      let r = (Math.random() * (width / 40)) + (Math.random() * height * Math.random() * Math.random());

      let collidesWithAnotherSun = false;
      for (let k = 0; k < suns.length; k++) {
        // Collision detect and make sure it's not overlapping.
        if (Math.abs(x - suns[k].x) < (r + suns[k].r) * 0.5 || Math.abs(y - suns[k].y) < (r + suns[k].r) * 0.5) {
          collidesWithAnotherSun = true;
          break;
        }
      }

      if (!collidesWithAnotherSun) {
        suns.push({
          x: x,
          y: y,
          r: r
        });
      }
    }

    let asteroids = [];
    let amountOfAsteroids = 1 + Math.floor(Math.random() * 200 * Math.random() * Math.random());
    for (let i = 0; i < amountOfAsteroids; i++) {
      let x = Math.random() * width;
      let y = Math.random() * height;
      let r = (height / 60) + (Math.random() * Math.random() * (height / 3));

      for (let sunIndex = 0; sunIndex < suns.length; sunIndex++) {
        let sunCenterX = suns[sunIndex].x;
        let sunCenterY = suns[sunIndex].y;
        let sunRadius = suns[sunIndex].r;

        // When it's on the sun try to choose a new position. If it happends 2x w/e.
        if (Math.sqrt(((x - sunCenterX) * (x - sunCenterX)) + ((y - sunCenterY) * (y - sunCenterY))) > (r * .5) + (sunRadius * .5)) {
          x = Math.random() * width;
          y = Math.random() * height;
        }
      }

      let collidesWithAnotherAsteroid = false;
      for (let k = 0; k < asteroids.length; k++) {
        // Collision detect and make sure it's not overlapping.
        if (Math.abs(x - asteroids[k].x) < (r + asteroids[k].r) * 0.5 || Math.abs(y - asteroids[k].y) < (r + asteroids[k].r) * 0.5) {
          collidesWithAnotherAsteroid = true;
          break;
        }
      }

      if (!collidesWithAnotherAsteroid) {
        asteroids.push({
          x: x,
          y: y,
          r: r
        });
      }
    }

    if (Math.random() > 0.3) {
      // Asteroid belts.
      let noiseScale = 0.007;

      let noiseOffsetX = Math.random() * 2000;
      let noiseOffsetY = Math.random() * 2000;
      let flowMove = (width / 100) + (Math.random() * Math.random() * (width / 20));

      let strokeColor = p5.color(pallete.stroke);
      let beltOpacity = Math.floor(Math.random() * 255);
      strokeColor.setAlpha(beltOpacity);
      p5.noStroke();
      p5.fill(strokeColor);
      let beltDots = 500 + Math.floor(Math.random() * 2000 * Math.random());
      for (let k = 0; k < beltDots; k++) {
        let dotX = Math.random() * width;
        let dotY = Math.random() * canvasHeight;

        let flowIntensity = flowMove * p5.noise((dotX + noiseOffsetX) * noiseScale, (dotY + noiseOffsetY) * noiseScale, 1 * noiseScale);
        let flowDir = (2 * Math.PI * p5.noise((dotX + (noiseOffsetX * 2)) * noiseScale, (dotY + (noiseOffsetY * 2)) * noiseScale, 1 * noiseScale));
        let xPush = Math.cos(flowDir) * flowIntensity;
        dotX += xPush;
        let yPush = Math.sin(flowDir) * flowIntensity;
        dotY += yPush;

        for (let w = 0; w < 25; w++) {
          flowIntensity = flowMove * p5.noise((dotX + noiseOffsetX) * noiseScale, (dotY + noiseOffsetY) * noiseScale, 1 * noiseScale);
          flowDir = (2 * Math.PI * p5.noise((dotX + (noiseOffsetX * 2)) * noiseScale, (dotY + (noiseOffsetY * 2)) * noiseScale, 1 * noiseScale));
          xPush = Math.cos(flowDir) * flowIntensity;
          dotX += xPush;
          yPush = Math.sin(flowDir) * flowIntensity;
          dotY += yPush;
        }

        let asteroidSize = Math.random() * (width / 400);
        p5.ellipse(dotX, dotY, asteroidSize, asteroidSize);
      }
    }

    let sunRadius = 5;
    let sunCenterX = 0;
    let sunCenterY = 0;
    let rayThinWeight = 0.5 + Math.random(); // width / 1000;
    let rayThiccWeight = rayThinWeight + Math.random(); // (width / 1000) + (Math.random() * (width / 250));
    let rays = 50 + Math.floor(Math.random() * 2000 * Math.random() * Math.random());
    for (let sunIndex = 0; sunIndex < suns.length; sunIndex++) {
      let sun = suns[sunIndex];
      sunRadius = sun.r;
      sunCenterX = sun.x;
      sunCenterY = sun.y;

      let lowOpacitySun = Math.random() > 0;
      let sunOpacity = Math.floor(Math.random() * 255);

      // Draw sun rays.
      rays = 50 + Math.floor(Math.random() * 2000 * Math.random() * Math.random());
      let rayLength = (Math.max(width, height) * 2) + sunRadius;

      let allowStorkeChange = Math.random() > 0.2;
      let flagStroke = false;

      let strokeColor = p5.color(pallete.stroke);
      if (lowOpacitySun) {
        strokeColor.setAlpha(sunOpacity);
      }
      p5.noStroke();
      p5.fill(strokeColor);

      rayThiccWeight = 0.25 + Math.random(); // (width / 1000) + (Math.random() * (width / 250));
      p5.strokeWeight(rayThiccWeight);
      let currentWeight = rayThiccWeight;

      let dotsOnLine = 100 + Math.floor(Math.random() * 500);

      for (let i = 0; i < rays; i++) {
        let rayAngle = ((i / rays) * Math.PI * 2);
        let rayX1 = sunCenterX + (Math.cos(rayAngle) * (sunRadius / 2));
        let rayY1 = sunCenterY - (Math.sin(rayAngle) * (sunRadius / 2));

        let fullRayLength = rayLength;

        if (flagStroke && allowStorkeChange) {
          flagStroke = false;
          p5.strokeWeight(rayThinWeight);
          currentWeight = rayThinWeight;
        } else {
          flagStroke = true;
          p5.strokeWeight(rayThiccWeight);
          currentWeight = rayThiccWeight;
        }

        let cutOffLength = fullRayLength;
        for (let k = 0; k < asteroids.length; k++) {
          let angle1 = getAngleBetweenTwoPoints(sunCenterX, sunCenterY, asteroids[k].x, asteroids[k].y - (asteroids[k].r * .5));
          let angle2 = getAngleBetweenTwoPoints(sunCenterX, sunCenterY, asteroids[k].x, asteroids[k].y + (asteroids[k].r * .5));
          let angle3 = getAngleBetweenTwoPoints(sunCenterX, sunCenterY, asteroids[k].x + (asteroids[k].r * .5), asteroids[k].y);
          let angle4 = getAngleBetweenTwoPoints(sunCenterX, sunCenterY, asteroids[k].x - (asteroids[k].r * .5), asteroids[k].y);

          if (Math.abs(asteroids[k].y - sunCenterY) < asteroids[k].r && asteroids[k].x > sunCenterX) {
            if (rayAngle === 0) {
              angle1 = -1;
              angle2 = 1;
            } else if (rayAngle < Math.PI) {
              angle1 = angle1 > Math.PI ? 0 : angle1;
              angle2 = angle2 > Math.PI ? 0 : angle2;
              angle3 = angle3 > Math.PI ? 0 : angle3;
              angle4 = angle4 > Math.PI ? 0 : angle4;
            } else {
              angle1 = angle1 < Math.PI ? Math.PI * 2 : angle1;
              angle2 = angle2 < Math.PI ? Math.PI * 2 : angle2;
              angle3 = angle3 < Math.PI ? Math.PI * 2 : angle3;
              angle4 = angle4 < Math.PI ? Math.PI * 2 : angle4;
            }
          }

          let minIntersectAngle = Math.min(angle1, angle2, angle3, angle4);
          let maxIntersectAngle = Math.max(angle1, angle2, angle3, angle4);

          if (rayAngle > minIntersectAngle && rayAngle < maxIntersectAngle) {
            // Make sure the asteroid also isnt in the sun.
            // if (Math.sqrt(((asteroids[k].x - rayX1) * (asteroids[k].x - rayX1)) + ((asteroids[k].y - rayY1) * (asteroids[k].y - rayY1))) > (asteroids[k].r * 0.5)) {
            if (Math.sqrt(((asteroids[k].x - sunCenterX) * (asteroids[k].x - sunCenterX)) + ((asteroids[k].y - sunCenterY) * (asteroids[k].y - sunCenterY))) > (asteroids[k].r * .5) + (sunRadius * .5)) {
              cutOffLength = Math.min(cutOffLength, Math.sqrt(((asteroids[k].x - rayX1) * (asteroids[k].x - rayX1)) + ((asteroids[k].y - rayY1) * (asteroids[k].y - rayY1))));
            }
          }
        }

        for (let k = 0; k < dotsOnLine; k++) {
          if (fullRayLength * (k / dotsOnLine) > cutOffLength) {
            break;
          }
          let dotX = sunCenterX + (Math.cos(rayAngle) * fullRayLength * (k / dotsOnLine)) + (Math.cos(rayAngle) * (sunRadius / 2));
          let dotY = sunCenterY - (Math.sin(rayAngle) * fullRayLength * (k / dotsOnLine)) - (Math.sin(rayAngle) * (sunRadius / 2));
          p5.ellipse(dotX, dotY, currentWeight, currentWeight);
        }
      }

      // Draw sun.
      p5.noStroke();
      let sunColor = p5.color(pallete.colors[0]);
      if (Math.random() > 0.8) {
        sunColor = p5.color(pallete.background);
      }
      if (Math.random() > 0.8) {
        sunColor = p5.color(255, 255, 255);
      }
      if (Math.random() > 0.6) {
        sunColor = p5.color(pallete.stroke);
      }

      if (Math.random() > 0.8) {
        sunColor = p5.color(0, 0, 0);
      }

      if (lowOpacitySun) {
        sunColor.setAlpha(Math.min(p5.alpha(sunColor), sunOpacity));
      }
      p5.fill(sunColor);
      if (Math.random() > 0.8) {
        p5.noFill();
      }

      p5.ellipse(sunCenterX, sunCenterY, sunRadius, sunRadius);
    }

    let randomColorsForHood = Math.random() > 0.7;

    for (let i = 0; i < asteroids.length; i++) {
      let asteroid = asteroids[i];

      p5.noStroke();
      if (randomColorsForHood) {
        p5.fill(pallete.colors[Math.floor(Math.random() * pallete.colors.length)]);
      } else {
        p5.fill(pallete.background);
      }
      p5.ellipse(asteroid.x, asteroid.y, asteroid.r, asteroid.r);
      p5.noFill();

      p5.translate(asteroid.x - (asteroid.r), asteroid.y - (asteroid.r));
      if (suns.length < 2) {
        let angleFromSun = getAngleBetweenTwoPoints(sunCenterX, sunCenterY, asteroid.x, asteroid.y);

        angleFromSun = (Math.PI * 2) - angleFromSun;
        drawHood(asteroid.r * 2, asteroid.r * 2, pallete, rayThinWeight, rayThiccWeight, rays, angleFromSun);
      }
      p5.translate(-(asteroid.x - (asteroid.r)), -(asteroid.y - (asteroid.r)));
    }
    let onlyWhiteSoots = Math.random() > 0.9;
    for (let i = 0; i < 6; i++) {
      if (Math.random() > 0.4) {
        drawSoot(0, 0, width, height, 0.05 + Math.random() * 0.3, onlyWhiteSoots);
      }
    }
  }

  return setup;
}
