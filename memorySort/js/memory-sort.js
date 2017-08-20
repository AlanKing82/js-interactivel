/*
 * 	Memory Sort - jQuery plugin 
 */
(function($){
   	$.fn.memorySort = function(settings) {
        var config = {
            attemptLives: 6
        };
        
	    if (settings) $.extend(config, settings);
	    //var frame = $("#myFrame").contents();
	    // var win = $("#myFrame")[0].contentWindow;
	        
	    //self.disable();
	        
	    var cards = [],
	        isText = false;
	        
	    $(this).each(function(e) {
	        
	        var topContent = $(this).find('.topContent'),
	            bottomContent = $(this).find('.bottomContent');
	        // text or image check
	        isText = topContent.children().is('p');
	        cards[e] = {
	                    'id': e+1,
	                    'top' : isText ? topContent.find('p').html() : topContent.find('img').attr('src'),
	                    'bottom' : bottomContent.find('img').attr('src'),
	                    'topname' : topContent.find('img').attr('alt'),
	                    'bottomname' : bottomContent.find('img').attr('alt')
	                	}
	    });
	        
		// game object	 
		var Memory = {
			init: function(cards){
	            var $this = this;
	         	// reference html elements
	           	this.$game = $(".memory-game");
	            this.$topImg = this.$game.next().find('img').eq(0).attr('src');
	            this.$bottomImg = this.$game.next().find('img').eq(1).attr('src');
	         	this.$modal = $('#modal');
				this.$countdown = $("#progressbar");
	            // add cards object to local 
	      		this.cardsArray = cards;
				this.$modalCards = $(".card");
				// number of cards on a row
				this.rowLength = this.cardsArray.length;
				// format modal display with appropriate class width 
	            this.$modalCards.addClass('size' + this.rowLength);
	            // trigger click to make modal pop up, after close start game
	            $(this.$modal).featherlight('.modalContent', {afterClose: $.proxy($this.setup, $this)}).trigger('click');
	            this.$countdown.empty();
	            // progress bar
				for (i = 0; i < this.rowLength; i++) { 
				    this.$countdown.append('<li class="size'+ this.rowLength +'"></li>');
				}

	        },
			setup: function(){
	            // shuffle top, bottom cards
	            this.topCards = this.reArrangeCards(this.cardsArray);
	            this.bottomCards = this.reArrangeCards(this.cardsArray);
	            // returned built html from shuffled arrays
	    		this.html = this.buildHTML();
			    // replace with new html
			    this.$game.html(this.html);
	            // select new arrangement
				this.$memoryCards = $(".card");
	            // format with size class
	            this.$memoryCards.addClass('size' + this.rowLength);
	            // bind click event
				this.binding();
				// game variable init
				this.paused = false;
	     	    this.guess = null;
	            this.attemptCount = 0;
	            this.matched = 0;
	            // display game
	            this.$game.add(this.$countdown).slideDown();
	            // css3 features not supported ie8
	            if($.isIE(8,'lte'))
	            	this.$countdown.hide();
	            this.$memoryCards.find(".inside").removeClass("matched");
	            // reset text results
	            this.$modal.find('div').addClass('inactive');
	        },
	        reArrangeCards: function(arr){
				return $(arr).shuffleArray();
			},
			binding: function(){
				this.$memoryCards.on("click", this.cardClicked);
			},
	        // each card clicked
			cardClicked: function(){
				var _ = Memory,
				    $card = $(this);

	           // do if game not paused, not matched already and card is active
	           if(!_.paused && !$card.find(".inside").hasClass("matched")
	                        && !$card.find(".inside").hasClass("picked")
	                        && !$card.find(".inside").hasClass("cardInactive")){
					
					$card.find(".inside").addClass("picked")

		       		// first pick
		            if(!_.guess){
		                     
		                if($card.hasClass('cardTop'))
		                    _.$memoryCards.filter('.cardTop').find(".inside").not(".matched").addClass('cardInactive')
		                else
		                    _.$memoryCards.filter('.cardBottom').find(".inside").not(".matched").addClass('cardInactive')
		                
		                // 'turnover' card
						$card.find(".inside").removeClass('cardInactive');
		                // save id of card as guess     
		                _.guess = $card.attr("data-id");
		                     
		                // save the index position of displaced card on opposite row
		                if($card.hasClass('cardTop'))
		                   _.firstPick = _.$memoryCards.index($card) + _.rowLength; 
		                else
		                   _.firstPick = _.$memoryCards.index($card) - _.rowLength;
		                    
		            }else{
		                // second pick, if matched     
		                if(_.guess == $(this).attr("data-id")){
		                    // match class added to both selected cards
		                    $(".picked").addClass("matched");
		                    // pause game
		                    _.paused = true;
		                    // cache to use in setTimeout 
		                    cardPos = _.guess; 
		                    // position of card to displace        
							_.displacedCard = _.$memoryCards.eq(_.firstPick);
		                    
		                    // swap matched card and displaced card
		                    setTimeout(function(){
								_.swapMatched($card, _.displacedCard, _.guess);
							}, 800);

		                    // reset guess
		                    _.guess = null;
		                    _.matched++;

						// not a match, revert classes after timeout    
		                } else {
		                    _.guess = null;
		                    _.paused = true;
		                    _.attemptCount++;
		                    _.countdown();

		                    setTimeout(function(){
		                        $(".picked").removeClass("picked");
									_.paused = false;
							}, 800);
						}
		                // make non-matched cards active
		                _.$memoryCards.find(".inside").not(".matched").removeClass('cardInactive')
		            }

		            // out of attempts
		            if(_.attemptCount === config.attemptLives){
		      			_.result(false);
		      			return;
		            }
		
		            // when all cards matched   
					if(_.matched === _.rowLength){
						_.result(true);
		         	}

				}
			},
	        swapMatched: function(card, displacedCard, data){
	            
	            var _ = Memory;
	            
	            var displacedHtml = displacedCard.html(),
	                displacedData = displacedCard.attr("data-id");
	            
	            var clickedDiv = $(card),
	       			distance = clickedDiv.offset().left - displacedCard.offset().left;

				_.paused = true;

	            $.when(clickedDiv.animate({
	               left: -distance
	            }, 500),
	            displacedCard.animate({
	                left: distance
	            }, 500)).done(function () {
	                
	                displacedCard.css('left', '0px');
	                clickedDiv.css('left', '0px');
	                
	                displacedCard.html(clickedDiv.html())
	  					.find(".inside")
	                    .removeClass('cardInactive');
					$(_.$memoryCards[$(card).index()])
	                    .html(displacedHtml)
	                    .attr("data-id", displacedData)
	                    .find(".inside")
	                    .removeClass("picked")

	           		_.paused = false;

	            });
	        },
			result: function(pass){
	            
	            var modalResult = this.$modal.find('.modalResult'),
	                game = this;
	            
	            this.paused = true;
	            
				setTimeout(function(){
	                
	              if(pass){
	                modalResult.find('div').eq(0).removeClass('inactive');
	                modalResult.find('span').html(game.attemptCount);
	              }else{
	                modalResult.find('div').eq(1).removeClass('inactive');
	              }
	                
	              $.featherlight(modalResult, {afterClose: $.proxy(game.reset, game), closeOnClick: false});
	              //self.enable();
				}, 1000);
			},
			reset: function(){
				this.setup();
	            this.$countdown.find('li').removeClass('empty active');
	         },
	        buildHTML: function(){
	            
				var frag = '',
	                topImg = this.$topImg,
	                bottomImg = this.$bottomImg;
	            
	            var test = '';

	            // top tier content
	            this.topCards.each(function(k, v){
	                
	                if(isText)
	                    subFrag = '<p>'+ v.top +'</p>'
	                else
	                    subFrag = '<img src="'+ v.top +'" alt="'+ v.topname +'" />'
	                
	                frag += '<div class="card cardTop" data-id="'+ v.id +'">\
	                            <div class="inside">\
					                <div class="front">\
	                                    ' + subFrag + '\
	                                </div>\
					                <div class="back">\
	                                    <img src="'+ topImg +'" />\
	                                </div>\
	                            </div>\
					          </div>';
				});
	      
	            // bottom tier images
	            this.bottomCards.each(function(k, v){
					frag += '<div class="card cardBottom" data-id="'+ v.id +'">\
	                            <div class="inside">\
					                <div class="front">\
	                                    <img src="'+ v.bottom +'" alt="'+ v.bottomname +'" />\
	                                </div>\
					                <div class="back">\
	                                    <img src="'+ bottomImg +'" />\
	                                </div>\
	                            </div>\
					          </div>';
				});
	            return frag;
			},
			countdown: function(){

				this.$countdown.find('li')
					.addClass('active')
					.eq(this.rowLength-this.attemptCount)
					.delay(1000)
					.queue(function(next){
					    $(this).addClass('empty');
					    next();
					});
			}
		};
	 
		Memory.init(cards);
	    
	    return this;
    };

})(jQuery);

/*
 *  Shuffle an array function
 */
(function($) {
   $.fn.shuffleArray = function() {
       // randomise array
       var currentIndex = this.length, temporaryValue, randomIndex ;
       
       // while there remain elements to shuffle...
       while (0 !== currentIndex) {

       // pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // and swap it with the current element.
        temporaryValue = this[currentIndex];
        this[currentIndex] = this[randomIndex];
        this[randomIndex] = temporaryValue;
    }

        return this;
   };
})(jQuery);

/*
 * Additional custom utility methods(not core jQuery) for use with plug-ins
 */
(function($){
    $.extend({
        // Returns array(string or int) with unique values
        uniqueArray: function (arr) {
            var i,
                len = arr.length,
                out = [],
                temp = { };

            for (i = 0; i < len; i++) {
                temp[arr[i]] = 0;
            }
            for (i in temp) {
                out.push(i);
            }
            return out;
        },
        // return number from element attribute
        getNum: function(el){
            return parseInt(el.match(/[\d\.]+/g));
        },
        // detect IE and version number through injected conditional comments 
        // (no UA detect, no need for cond. compilation / jscript check)
        // https://gist.github.com/paulirish/357741
        isIE: function(version, comparison){
            var cc      = 'IE',
            b       = document.createElement('B'),
            docElem = document.documentElement,
            isIE;
	    
            if(version){
                cc += ' ' + version;
                if(comparison){ cc = comparison + ' ' + cc; }
            }

            b.innerHTML = '<!--[if '+ cc +']><b id="iecctest"></b><![endif]-->';
            docElem.appendChild(b);
            isIE = !!document.getElementById('iecctest');
            docElem.removeChild(b);
            return isIE;
        },
        // Touch detection
        isTouch: function(){
            var isTouch = ("ontouchstart" in document.documentElement);	
	        return isTouch;
        },
        // Fix for disappearing elements in LessonFrame for activity screens
        // Eventum issue #3076 - ios8/Safari/iPad Air/iPad Mini 2 (Browserstack)
        iPadFixNavVisibility: function(){
            var navButtonDiv = document.getElementById('navigation');
                   
                setTimeout(function () { 
                $(navButtonDiv).hide(0, function() {
                    $(this).show();
                });

            }, 0);
        }
    });
})(jQuery);