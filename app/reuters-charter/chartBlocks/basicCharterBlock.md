//full block

		Reuters.Graphics.sharePrice = new Reuters.Graphics.LineChart({
			el: "#reutersGraphic-chart1",
			dataURL: '//d3sl9l9bcxfb5q.cloudfront.net/json/mw-disney-earns',
// 			dataURL:"data/data.csv",
			height:220, //if < 10 - ratio , if over 10 - hard height.  undefined - square
//			columnNames:{sandp:gettext("S&P 500"), disney:gettext("Disney")}, // undefined uses sheet headers, object will map, array matches columnNamesDisplay
//			colors: [blue3, purple3,orange3, red3,yellow3],  //array or mapped object
//			dataType:'value',//value, changePreMonth, CumulativeChange, percentChange, cumulate
//			YTickLabel: [[gettext(""),gettext("%")]], //  \u00A0  - use that code for a space.
//			xScaleTicks: 5,
//			yScaleTicks:5,
//			dateFormat: d3.time.format("%b %Y"),
//			quarterFormat:true,
//			numbFormat: d3.format(",.1f"),
//			divisor:1000,

//			columnNamesDisplay:[gettext("Bob"),gettext("Jerry")], // only use this if you are using an array for columnNames
//			colorUpDown:true,
//			hashAfterDate:"01/01/2016", //requires you to run bower install -save textures
//			hasLegend: false,
//			showTip:true,
//			showZeros:true, //tooltip will not skip over zero values
//			yScaleVals: [0,100],
//			tickAll:true, //if you make tickAll anything, it will put a tick for each point.
//			horizontal:true,
//			xScaleColumn:"days",
//			margin: {top: 60, right: 80, bottom: 60, left: 130},
//			groupSort:"ascending", // ascending descending or array or 'none'
//			categorySort:"ascending", //ascending descending, array or 'none'
//			parseDate:d3.time.format("%d/%m/%y").parse // can change the format of the original dates
//			hasRecessions: true,
//			hasZoom: true,
//			dataStream:true,
//			timelineData:"data/timeline.csv", //dates much match source dates 
//			tipNumbFormat: function(d){
//				var self = this;
//				if (isNaN(d) === true){return "N/A";}else{
//					return self.dataLabels[0] + self.numbFormat(d) + " " + self.dataLabels[1] ;				
//				}				
//			},
//			lineType: "linear",//step-before, step-after
//			topLegend:true,
//			chartBreakPoint:400, //when do you want the legend to go up top
//			topLegend:true,
//			markDataPoints:true,
//			multiDataColumns:["gpd","unemployment"],//can use value,changePreMonth, CumulativeChange, percentChange
//			multiDataLabels:[gettext("VALUE"),gettext("PERCENT")],
//			chartLayout:"stackPercent", // basic,stackTotal, stackPercent, fillLines, sideBySide, onTopOf, outlineBar
//			chartLayoutLables:["stackPercent", "basic","stackTotal","fillLines"], //define this, and buttons appear
//			yorient:"right",
//			xorient:"top",
//			yTickFormat:function(d){
//				var numbFormat = d3.format(".2f")
//				return numbFormat(d)
//			},
//			xTickFormat:function(d){
//				var dateFormat = d3.time.format("%b %Y")
//				return dateFormat(d)
//			},
//			navSpacer:true,
//			tipTemplate:Reuters.Graphics.Template.tooltip,
//			chartTemplate:Reuters.Graphics.Template.chartTemplate,
//			legendTemplate: Reuters.Graphics.Template.legendTemplate,
//			timelineTemplate:Reuters.Graphics.Template.tooltipTimeline,	
//			isPoll:true,
//			moeColumn:"ci",
//			leftBarCol:"contact",
//			rightBarCol:"leaks",
//			centerCol:"dk",
	
		});


//annotations:
/*
			//annotationDebug:true,
			annotations:function(self){
				if (!self){self = this};
				return [
					
			        {
			          note: {
			            label: "Basic settings with subject position(x,y) and a note offset(dx, dy)",
			            title: "basic",
			            wrap:150,
						//dyOffset:0.8,	            
						//dyOffsetLabel:-0.8,
						//dyOffsetTitle:-0.8,			            
			          },
			          data:{date:"02/05/2016",yvalue:1880},
			          dy: -30,
			          dx: 35
			        },
			        
			        {
			          note: {
			            label: "Added connector end 'arrow', note wrap '180', and note align 'left'",
			            title: "Arrow", // commenting this out will make no title
			            wrap: 150, // how wide do you want it to be
						//dyOffset:0.8,	            
			            align: "left" // will the blurb be centered at the connection point, or left or right aligned?
			          },
			          className:"special-blurb", // add a specific class
			          connector: {
			            end: "arrow" // 'dot' also available
			          },
			          //data:{date:"03/01/2016",yvalue:1978}, // instead of data, you can use a specific x and y, as shown below
					  x:self.width / 2,
					  y:0,
			          dy: 80,
			          dx: 0
			        },
			        
			        {
			          note: {
			            label: "Changed connector type to 'curve'",
			            title: "dot and curve",
			            wrap: 0,
						//dyOffset:0.8,	            
			          },
			          connector: {
			            end: "dot",
			            type: "curve", // this adds in teh curve
			            points: 1 // number of points on the curve
			          },
			          data:{date:"03/21/2016",yvalue:2052},
			          dy: 100,
			          dx: 100
			        },
			        
			        {
			          type: d3.annotationCalloutCircle, // this sets as a circle
			          note: {
			            label: "A different annotation type",
			            title: "It's a circle",
			            wrap: 100,
						//dyOffset:0.8,	            			            
			            align: "middle"		            
			          },
			          subject: {
			            radius: 10
			          },
			          data:{date:"04/11/2016",yvalue:2045},
	
			          dy: 115,
			          dx: 102
			        },
					
					
					{
			          type: d3.annotationXYThreshold,	 //vertical line			
					  note: {
					    label: "Longer text to show text wrapping",
					    title: "Vertical Line"
					  },
			          data:{date:"03/21/2016",yvalue:980},
					  dy: 0,
					  dx: 10,
					  disable:["connector"], //connector, subject or note
					  subject: {
					    y1: 0,
					    y2: self.height
					  }
					},

					{
			          type: d3.annotationXYThreshold,	// horizontal line			
					  note: {
					    label: "Longer text to show text wrapping",
					    title: "Horizontal Line"
					  },
			          data:{date:"03/21/2016",yvalue:470},
					  dy: 0,
					  dx: 10,
					  disable:["connector"], //connector, subject or note
					  subject: {
					    x1: 0,
					    x2: self.width
					  }
					},
					//makes a box
			        {
				      type:d3.annotationCalloutRect,
			          note: {
			            label: "Basic settings with subject position(x,y) and a note offset(dx, dy)",
			            wrap:150,
						//"align":"end",			            
			          },
			          data:{date:"02/17/2016",yvalue:0},
			          subject:{
				          width:self.scales.x(self.parseDate("02/24/2016")) - self.scales.x(self.parseDate("02/17/2016")),
				          height:-self.height
			          },
			          disable:["connector"],
			          dy: -176,
			          dx: -10
			        },					
	
			        ]
			    }		
*/

//simple blocks
/*
Reuters.Graphics.sharePrice = new Reuters.Graphics.LineChart({
	el: "#reutersGraphic-chart",
	dataURL: '//d3sl9l9bcxfb5q.cloudfront.net/json/mw-disney-earns',
	height:300, //if < 10 - ratio , if over 10 - hard height.  undefined - square
});

Reuters.Graphics.sharePrice = new Reuters.Graphics.BarChart({
	el: "#reutersGraphic-chart",
	dataURL: '//d3sl9l9bcxfb5q.cloudfront.net/json/mw-disney-earns',
	height:300, //if < 10 - ratio , if over 10 - hard height.  undefined - square
});
*/

//Trigger codes

/*
Reuters.Graphics.sharePrice.on("renderChart:start", function(evt){
    var self = this;
    
})		
Reuters.Graphics.sharePrice.on("renderChart:end", function(evt){
    var self = this;
    
})		
Reuters.Graphics.sharePrice.on("update:start", function(evt){
    var self = this;
    
})		
Reuters.Graphics.sharePrice.on("update:end", function(evt){
    var self = this;
    
})		
Reuters.Graphics.sharePrice.on("baseRender:start", function(evt){
    var self = this;
    
})		
Reuters.Graphics.sharePrice.on("baseRender:end", function(evt){
    var self = this;
    
})		
Reuters.Graphics.sharePrice.on("baseUpdate:start", function(evt){
    var self = this;
    
})		
Reuters.Graphics.sharePrice.on("baseUpdate:end", function(evt){
    var self = this;
    
})	
*/	



// datastream formatting:
/*
d3.json("//fingfx.thomsonreuters.com/ppe/gfx/graphicstestsite/1/366/738/bls2.json", function(data){
	console.log(data)
				
	function formatData (response){
		var newArray = []
		
		response.Dates.forEach(function(d,i){					
			var obj={}

			var newDate = d.replace(/\//g, '').replace('Date(','').replace(')','').replace('+0000','')
			var date = new Date(+newDate)
			var betterDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60000)
			var formatDate = (betterDate.getMonth()+1)+"/"+betterDate.getDate()+"/"+betterDate.getFullYear()

			obj.date = formatDate
			response.DataTypeValues[0].SymbolValues.forEach(function(item,index){
				var name = response.DataTypeValues[0].SymbolValues[index].Symbol;					
				var values = response.DataTypeValues[0].SymbolValues[index].Value
				if (_.isArray(values)){
					obj[name] = values[i];								
				}else{
					obj.values = obj.values || []
					var newObj = {
						category:name,
						value:values
					}
					obj.values.push(newObj)
				}
			})
			
			if (obj.values){
				newArray = obj.values;
			}else{
				newArray.push(obj)							
			}
			
		})
		return newArray
	}

	if (data.DataResponses){
		formattedData = {}
		data.DataResponses.forEach(function(response, index){
			formattedData["series"+index] = formatData(response)			    	
		})				
	}

	if (data.DataResponse){
		formattedData = formatData(data.DataResponse)
	}

	console.log(formattedData)	
	
})
*/
