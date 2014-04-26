//thanks StackOverflow for this function!!!
//http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
//but added one more parameter to validate positive number as well

//20140309 Update to an OO approach for easier upgrades and structure

function Stock(s0, mean, vol, h) {

	this.s0 = s0;
	this.mean = mean;
	this.curr = this.s0;
	this.vol = vol;
	this.h = h;
	this.c = document.getElementById("stockpath");
	this.ctx = this.c.getContext("2d");
	//ctx styling 
	this.ctx.lineWidth = 0.6;
	this.ctx.lineCap = 'round';	
	this.ctx.fillStyle= "#000000";
	this.trace = [this.s0];
	var _this = this;
	
	m = new MersenneTwister();

	this.init = function() {
		//console.log(this.s0);

		i = 30.5;
		height  = this.c.height;
		width = this.c.width;
		starth = 500;
		bottompadd = 0.5;
		start = height-starth+starth/2;
		multi = starth/2/this.s0;
		step = 5;

		//draw y-axis
		this.ctx.beginPath();
		this.ctx.moveTo(i,0);
		this.ctx.lineTo(i,height-bottompadd);
		this.ctx.stroke();
		this.ctx.textBaseline = 'middle';
		this.ctx.textAlign = 'center';
		//draw y-axis ticker
		for (var j = - this.s0; j < 15000; j+=step) {
			this.ctx.fillStyle= "#000000";
			this.ctx.beginPath();
			this.ctx.lineWidth = 1;
			this.ctx.moveTo(i-10,start-j*multi);
			this.ctx.lineTo(i,start-j*multi);
			this.ctx.stroke();
			this.ctx.fillText(j+s0,10,start-j*multi);
			
			this.ctx.fillStyle= "#CCCCCC";
			this.ctx.beginPath();
			this.ctx.lineWidth = 0.1;
			this.ctx.moveTo(i,start-j*multi);
			this.ctx.lineTo(width,start-j*multi);
			this.ctx.stroke();
		};
		//draw x-axis
		this.ctx.fillStyle= "#000000";
		this.ctx.beginPath();
		this.ctx.lineWidth = 1;
		this.ctx.moveTo(i,height-bottompadd);
		this.ctx.lineTo(width,height-bottompadd);
		this.ctx.stroke();

		$("#currPrice").text(this.curr);
		this.ctx.save();
		this.ctx.lineWidth = 1;
		this.ctx.beginPath();
		this.ctx.moveTo(i,start);
		//console.log(this);
	}

	this.loop = function() {
		//inc follow Z(0,1)
		var inc = normsinv(m.random());
		var last = _this.curr;
		_this.curr = _this.curr*Math.exp((_this.mean*_this.h-(Math.pow(_this.vol,2)*_this.h)/2)+_this.vol*Math.sqrt(_this.h)*inc);
		/*console.log(_this.s0);
		console.log(_this.h);
		console.log(_this.mean);
		console.log(_this.vol);
		console.log(_this.curr);*/
		//_this.curr = last;
		//console.log(_this);
		var diff = _this.curr-last;
		$("#currPrice").text(Math.round(_this.curr*100)/100);
		_this.trace.push(Math.round(_this.curr*100)/100);
		_this.ctx.lineTo(i,start-multi*diff+0.5);
		_this.ctx.lineJoin = 'miter';
		_this.ctx.stroke();
		i+=0.5;
		start = start-multi*diff;
	}

	this.buy = function() {
		var price = $("#currPrice").text();
		var amount = $("[name=buy-amount]").val();

		if ( !isNumber(price) || !isNumber(amount) ) {

			$("[name=buy-amount]").val("");

		} else if ( Math.round((_game.cash-price*amount)*100)/100 < 0 ) {

			alert("You don't have enough cash!");

		} else {
			
			$("#stock-aggregate").before("<tr class=\"trade-row\" data-amount=\""+amount+"\" data-price=\""+price+"\"><td>"+amount+"</td><td>"+price+"</td></tr>");

			$("[name=buy-amount]").val("");

			this.balance(price,amount);
		}
	}

	this.sell = function() {
		var price = $("#currPrice").text();
		var amount = $("[name=sell-amount]").val();

		if ( !isNumber(price) || !isNumber(amount) ) {

			$("[name=sell-amount]").val("");

		} else {

			$("#stock-aggregate").before("<tr class=\"trade-row\" data-amount=\"-"+amount+"\" data-price=\""+price+"\"><td>("+amount+")</td><td>"+price+"</td></tr>");

			$("[name=sell-amount]").val("");

			this.balance(price,-amount);

		}
	}

	this.balance = function(price,amount) {
		$("#aggregate-cash").text(Math.round((_game.cash-price*amount)*100)/100);
		$("#aggregate-cash").formatCurrency({'roundToDecimalPlace': 2});
		//console.log(Math.round((_game.cash-price*amount)*100)/100);
		$("#aggregate-stock").text(parseInt($("#aggregate-stock").text())+parseInt(amount));
	}

	this.clear = function() {
		var balance = 0;
		$("tr.trade-row").each(function(){
			//console.log($(this).data('amount'));
			//console.log($(this).data('price'));
			balance-= parseFloat($(this).data('amount')) * parseFloat($(this).data('price'));
		});

		//while clear poition, have to cover the shorts/sell remaining stocks.
		//TODO

		if ( balance > 0 ) {
			alert('Congratulations!\n' + 'You have gained $'+Math.round(balance*100)/100+' in this trading session!');
		} else if ( balance == 0 ) {
			alert('A draw! Try again!');
		} else {
			alert('Too bad......\n' + 'You have lost $'+Math.round(-balance*100)/100+' in this trading session!');
		}

		//clear all entered details
		$("tr.trade-row").remove();
		$("#aggregate-cash").text('0');
		$("#aggregate-stock").text('0');
		$("[name=sell-amount]").val("");
		$("[name=buy-amount]").val("");
		//console.log(balance);
	}
} 



function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n) && (parseFloat(n) >= 0);
}

function Game(cash) {

	this.cash = cash;
	this.stock1 = new Stock(25, 0.05, 0.2, 1/251/2);
	_game = this;

	this.init = function() {
		$("#aggregate-cash").text(this.cash);
		$('#aggregate-cash').formatCurrency({'roundToDecimalPlace': 2});
		this.stock1.init();
		setInterval(this.stock1.loop, 400);
	}
}