const getDonut = (objectList, logoUrl, divID, fullPercentage, description) => {
    const {XMLParser, XMLBuilder} = require("fast-xml-parser/src/fxp");
    const fabric = require("fabric").fabric;
    const fabricCanvas = window._canvas = new fabric.Canvas('c', {height: 400, width: 280});
    const radius = 120
    let imgCount = 0
    const breakCount = objectList.length;
    const strokeWidth = 35;
    const smallRadius = strokeWidth / 2 - 1
    const nleft = 0;
    const ntop = 0;
    const smallFontSize = strokeWidth / 2.7
    const fontSizeBig = radius / 2.5;
    const fontSizeDesc = radius / 7;

    let addLegend = (text, imageUrl, color, row, column) => {
        const legendFontSize = 15;
        const legendText = new fabric.Text(text, {
            fill: color,
            fontSize: legendFontSize,
            left: nleft + 15 + 2 * legendFontSize + column * 140,
            top: ntop + 2 * radius + 1.5 * strokeWidth + row * (legendFontSize + 10),
            fontFamily: 'Arial',
            fontWeight: 'bold',
        });

        fabricCanvas.add(legendText);
        fabric.Image.fromURL(imageUrl, function (oImg) {
            const scaleFactor = (legendFontSize + 5) / oImg.height
            const img = oImg.scale(scaleFactor)
            img.set({
                left: nleft + 15 + legendFontSize / 10 + column * 140,
                top: ntop + 2 * radius + 1.5 * strokeWidth + row * (legendFontSize + 10)
            })
            fabricCanvas.add(img);

            fabricCanvas.renderAll()
            imgCount++;
            if (imgCount === breakCount) {
                const svgXml = fabricCanvas.toSVG();
                let svgContainer = document.getElementById(divID);
                const xmlOptions = {
                    ignoreAttributes: false,
                    attributeNamePrefix: "@_"
                };
                const parser = new XMLParser(xmlOptions);
                let jObj = parser.parse(svgXml);
                jObj['@_width'] = fabricCanvas.width;
                jObj['@_height'] = fabricCanvas.height;
                const builder = new XMLBuilder(xmlOptions);
                const xmlContent = builder.build(jObj);
                svgContainer.innerHTML = xmlContent;
                console.log(xmlContent)
            }

        });
    }

    let totalPercentage = 0;
    objectList.forEach(item => {
        totalPercentage += item.percentage;
    })
    const totalAngle = 2 * Math.PI
    let startAngle = -Math.PI / 2
    const handleCircleMetadata = []
    const epsilon = 0.1
    if (Math.abs(fullPercentage - totalPercentage) > epsilon) {
        const remainingPercentage = fullPercentage - totalPercentage
        objectList.push({color: "#D3D3D3", percentage: remainingPercentage})
    }

    objectList.forEach(item => {
        const itemRatio = item.percentage / fullPercentage;
        const angleDifference = itemRatio * totalAngle;
        const endAngle = angleDifference + startAngle;
        let cir = new fabric.Circle({
            startAngle: startAngle,
            endAngle: endAngle,
            left: nleft,
            top: ntop,
            radius: radius,
            fill: '',
            strokeWidth: strokeWidth,
            stroke: item.color
        })
        const circleCenter = {
            x: nleft + radius,
            y: ntop + radius
        }
        const y = circleCenter.y + smallRadius + 1 + (radius) * Math.sin(endAngle);
        const x = circleCenter.x + smallRadius + (radius) * Math.cos(endAngle);
        const y1 = radius + smallRadius + 1 + (radius) * Math.sin(startAngle);
        const x1 = radius + smallRadius + 1 + (radius) * Math.cos(startAngle);
        const y2 = radius + smallRadius + 1 + (radius) * Math.sin(endAngle);
        const x2 = radius + smallRadius + 1 + (radius) * Math.cos(endAngle);
        handleCircleMetadata.push({x: x, y: y, x1: x1, y1: y1, x2: x2, y2: y2})
        fabricCanvas.add(cir);
        startAngle = endAngle;
    })
    handleCircleMetadata.forEach((item, index) => {
        const x = item.x;
        const y = item.y;
        const handleCircle = new fabric.Circle({
            radius: smallRadius,
            fill: objectList[index].color,
            strokeWidth: 1,
            stroke: "white",
            originX: 'center',
            originY: 'center'
        });

        const text = new fabric.Text(`${objectList[index].percentage}%`, {
            fill: "#ffffff",
            fontSize: smallFontSize,
            originX: 'center',
            originY: 'center',
            fontFamily: 'Arial',
            fontWeight: 600,
        });

        const group = new fabric.Group([handleCircle, text], {
            left: x - smallRadius,
            top: y - smallRadius,
        });
        fabricCanvas.add(group);
    })

    const margin = 10;
    const textBig = new fabric.Text(`${totalPercentage}%`, {
        fill: "black",
        fontSize: fontSizeBig,
        left: nleft + radius + strokeWidth / 2,
        top: ntop + radius + fontSizeBig / 4 + strokeWidth / 2,
        originX: 'center',
        originY: 'center',
        fontFamily: 'Arial',
        fontWeight: 'bold',
    });
    fabricCanvas.add(textBig);
    const descText = new fabric.Text(description, {
        fill: "#808080",
        fontSize: fontSizeDesc,
        left: nleft + radius + strokeWidth / 2,
        top: ntop + radius + fontSizeBig / 1.5 + strokeWidth,
        originX: 'center',
        originY: 'center',
        fontFamily: 'Arial',
        fontWeight: 550,
    });
    fabricCanvas.add(descText);
    let allObjects = fabricCanvas.getObjects();
    const text = allObjects[allObjects.length - 1]
    const textHeight = text.height;
    let group = [];
    fabric.loadSVGFromURL(logoUrl, function (objects, options) {

        let loadedObjects = new fabric.Group(group);

        loadedObjects.set({
            left: nleft + radius + strokeWidth / 2,
            top: ntop + radius - fontSizeBig / 2 - margin + strokeWidth / 2,
            originX: 'center',
            originY: 'center'
        });

        fabricCanvas.add(loadedObjects);
        allObjects = fabricCanvas.getObjects();
        const svg = allObjects[allObjects.length - 1];
        const heightRatio = 1.5 * textHeight / svg.height;
        const widthRadio = 1.5 * textHeight / svg.width;
        if (heightRatio > widthRadio) {
            svg.scale(heightRatio)
        } else {
            svg.scale(widthRadio)
        }
        fabricCanvas.renderAll();
        objectList.forEach((item, index) => {
            if (item.hasOwnProperty('imageUrl')) {
                const row = Math.floor(index / 2)
                const column = index % 2

                addLegend(item.text, item.imageUrl, item.color, row, column)
            }

        })


    }, function (item, object) {
        object.set('id', item.getAttribute('id'));
        group.push(object);
    });

}
module.exports = getDonut;