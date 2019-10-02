
$(".main").html(Reuters.Graphics.Template.basicChartLayout())

var trumpRed = "#f3686c";
var trumpRedlight = "#fbc6c8";
var trumpReddark ="#ee2127";
	
		Reuters.Graphics.refugeequota = new Reuters.Graphics.LineChart({
			el: "#reutersGraphic-chart-immigration-refugeequota",
			dataURL: '//d3sl9l9bcxfb5q.cloudfront.net/json/cc_usa_immigration_refugees_quota',
			height:250,
			columnNames:{ceiling:"Ceiling", actual:"Arrivals", ceilingtemp:"Ceilingtemp"},
			YTickLabel: [[gettext(""),"\u00A0" + gettext("people")]],
			colors:{ceiling:black, actual:tangerine4, actualmin:tangerine4,ceilingtemp:black},
			dateFormat: d3.time.format("FY%Y"),
			showTip:true,
			chartBreakPoint:1200,
			lineType: "step",
  			chartLayout:"fillLines",
  			tipTemplate:Reuters.Graphics.Template.refugeetooltip,
  			legendTemplate:Reuters.Graphics.Template.refugeelegend,
  			// scrollAnimate:function(){return },		
			xTickFormat:function(d,i){
				var dateFormatFY = d3.time.format("FY%Y")
				var dateFormat = d3.time.format("%Y")
				if (i == 0){
					return dateFormatFY(d)					
				}
				return dateFormat(d)
			},
		});


        Reuters.Graphics.refugeequota.on("chart:loaded", function(){

    		var that = this;
    		
    		that.lineChart.sort(function(a,b){
					if (a.name == "ceiling"){
						return 1;
					}else{return -1;}
				}).order()
				.on("mouseover", function (d){	return});
				
				
    		that.area
    		    .y0(function(d) {
	    		    if (d.name == "ceiling"){
		    		    return that.scales.y(d[that.dataType])
	    		    }
	    		    return that.scales.y(0);
	    		    
	    		   })
				.defined (function(d) { return !isNaN(d[that.dataType]); });
	    		   
        })	


		Reuters.Graphics.refugee = new Reuters.Graphics.BarChart({
			el: "#reutersGraphic-chart-immigration-refugee",
			dataURL: '//d3sl9l9bcxfb5q.cloudfront.net/json/sz_tavel_ban_refugees',
			height:250,
			columnNames:{number:gettext("numbers")},
			YTickLabel: [[gettext(""),"\u00A0" + gettext("people")]],
			colors:{tangerine4},
			dateFormat: d3.time.format("FY%Y"),
			xTickFormat:function(d,i){
				var dateFormatFY = d3.time.format("FY%Y")
				var dateFormat = d3.time.format("%Y")
				if (i == 0){
					return dateFormatFY(d)					
				}
				return dateFormat(d)
			},
			showTip:true,
			hasLegend:false,
			yScaleVals: [0,10000,20000, 30000],
			hashAfterDate: "1/1/2018",
			scrollAnimate:function(){return },
			
		});


		Reuters.Graphics.refugeeTotal = new Reuters.Graphics.BarChart({
			el: "#reutersGraphic-chart-immigration-refugee-total",
			dataURL: '//d3sl9l9bcxfb5q.cloudfront.net/json/cc_trump_effect_immigration_refugee',
			height:250,
			YTickLabel: [[gettext(""),"\u00A0" + gettext("people")]],
			colors:{tangerine4},
			dateFormat: d3.time.format("%b %Y"),
			showTip:true,
			hasLegend:false,
			yScaleVals: [0,5000,10000,15000],
			hashAfterDate: "8/01/2019",
			scrollAnimate:function(){return },
						annotations:function(self){
				if (!self){self = this};
				return [
													
					{
			          type: d3.annotationXYThreshold,			
					  note: {
					    label: "TRUMP TAKES OFFICE",
					  },
			          data:{date:"01/20/2017",yvalue:15500},
					  dy: 0,
					  dx: -1,
					  disable:["connector"], //connector, subject or note
					  subject: {
					    y1: 0,
					    y2: self.height
					  }
					},	

					// {
			  //         type: d3.annotationXYThreshold,			
					//   note: {
					//     label: "TRAVEL BAN TAKES EFFECT",

					//   },
			  //         data:{date:"12/04/2017",yvalue:15000},
					//   dy: 10,
					//   dx: 5,
					//   disable:["connector"], //connector, subject or note

					//   subject: {
					//     y1: 0,
					//     y2: self.height
					//   },
					// },	
			        ]
			    }		
			
		});
        

		// Reuters.Graphics.refugeePetition = new Reuters.Graphics.BarChart({
		// 	el: "#reutersGraphic-chart-immigration-petition",
		// 	dataURL: '//d3sl9l9bcxfb5q.cloudfront.net/json/sz_usa_immigration_refugees_petition',
		// 	height:250,
		// 	columnNames:{received:gettext("Received"),approved:gettext("Approved")},
		// 	groupSort:"ascending",
		// 	YTickLabel: [[gettext(""),"\u00A0" + gettext("requests")]],
		// 	colors:{tangerine4, gray3},
		// 	dateFormat: d3.time.format("FY%Y"),
		// 	xTickFormat:function(d,i){
		// 		var dateFormatFY = d3.time.format("FY%Y")
		// 		var dateFormat = d3.time.format("%Y")
		// 		if (i == 0){
		// 			return dateFormatFY(d)					
		// 		}
		// 		return dateFormat(d)
		// 	},
		// 	showTip:true,
		// 	topLegend:true,			
		// 	yScaleVals: [0,5000,10000,15000, 20000],
		// 	hashAfterDate: "01/01/2018"
			
		// });
			
		
		// Reuters.Graphics.refugeebystate = new Reuters.Graphics.MapGenerator({
		// 	el: "#reutersGraphic-map-immigration-refugeebystate",
		// 	mapShapeURL: "//graphics.thomsonreuters.com/mapshapes/us-simple.json",
		// 	mapDataURL:"//d3sl9l9bcxfb5q.cloudfront.net/json/cc_usa_immigration_refugees_2018",
		// 	projection: "mercator",
		// 	objectName:"states",
		// 	dataIdProperty:"fips",
		// 	labelColumn:"STATEAP",
		// 	center:[ -98.5561,37.8106],
		// 	rotate:[-1.4,0],
		// 	scaleModifier:.95,
		// 	heightModifier:.59,
		// 	colorDomain:[1,99,500,1000],
		// 	colorRange:[gray1,tangerine2,tangerine4,tangerine6],
		// 	scaleDisplay:["None","Less than 100","101-500","501-1,000",],
		// 	legendTemplate:Reuters.Graphics.Template.refugeeMaplegend,
		// 	tooltipTemplate:Reuters.Graphics.Template.refugeeMaptooltip,
		// 	scaleType:"threshold",
		// 	colorValue:"total2018",
		// }); 
	