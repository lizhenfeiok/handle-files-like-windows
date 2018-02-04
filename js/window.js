(function($){

	$.fn.extend({

		chosens : function(chosenClass){
			return this.find("."+chosenClass);
		},

		//ctrl、shift键选择
		mouseSelect : function(opts){
			var $parent = this;

			$parent.off(".mouse").on({
				"mousedown.mouse" : function(){
					var chosen = opts.chosenClass;
					$(this).chosens(chosen).removeClass(chosen);
				}
			}).on({
				"mousedown.mouse" : function(event){
					var chosen = opts.chosenClass;
						//多文件夹+选中的其中一个+右键 = true
						moreAndRight = $parent.chosens(chosen).length>1 
							&& event.button==2 && $(this).hasClass(chosen);

					if(!moreAndRight)_mdown_ctrl_shift.call(this,event,$parent,chosen);
					event.stopPropagation();
				}
			},opts.children);

			return this;

			function _mdown_ctrl_shift(e,$parent,chosenClass){
				var $this = $(this),
					$choose = $parent.chosens(chosenClass),
					//上一次选中为计算shift键的起始文件
					$shiftStart = $parent.find(".shiftStart");     
				
				//未按shift键
				if(e.shiftKey != 1){
					e.ctrlKey ? $this.toggleClass(chosenClass):     //按ctrl键
					$this.addClass(chosenClass).siblings().removeClass(chosenClass);//未按ctrl键

					$this.addClass("shiftStart").siblings().removeClass("shiftStart");
					//按shift键
				}else if(this !== $shiftStart[0]){
					$choose.removeClass(chosenClass);
					var $start = $this.addClass(chosenClass),
						$last = $shiftStart.addClass(chosenClass);

					if($start.index() > $last.index()){
						$last.nextUntil($start).addClass(chosenClass);
					}else{
						$last.prevUntil($start).addClass(chosenClass);
					}
				}
			}
		},

		mouseMenu : function(opts){
			var mouseId = +String(Math.random()).substr(2,8),
				$container = this,
				events = {
					"mousedown.menu" : removeMenu,

					"contextmenu.menu" : function(e){
						var menu = "",$this = $(this),
							$chosens = $container.chosens(opts.chosenClass);

						if(this == $container[0]){
							menu = opts.blankMenu($this);
						}else{
							menu = opts.itemMenu($this,$chosens);
						}

						if(menu){
							$("body").append(makeMenu(menu));
							menu_hasMore(0,$this,$chosens);
							showFullMouseR(e);
							e.stopPropagation();
							e.preventDefault();
						}
					}
				};

			return this.off(".menu").on(events).on(events,opts.children);

			//删除右键菜单
			function removeMenu(){
				$("[mouseId='"+mouseId+"']").remove();
			}

			//生成右键菜单
			function makeMenu(menu){
				if(!menu)return "";
				
				//增加右键菜单图标
				return "<ul class='mouseMenu' mouseId = '"+mouseId+"'>"+
					menu.replace(/(<li[^<>]*?>)(.*?)(<\/li>)/g,function(all,li_,content,_li){
						return li_ + opts.iconHtml(content) + ' ' + content + _li;
					})+"</ul>";
			}

			//箭头出现的菜单项
			function menu_hasMore(index,$target,$chosens){
				$("[mouseId='"+mouseId+"']").eq(index).on({
					"mouseenter" : function(e){
						var $this = $(this);
						$this.siblings().removeClass("li-chosen");
						$("[mouseId='"+mouseId+"']:gt("+index+")").remove();
						
						if($this.hasClass("arrowicon")){
							$this.addClass("li-chosen");
							this.onclick = function(e){e.stopPropagation();}
							$("body").append(makeMenu(opts.smallMenu(this.id,$target,$chosens)));
							showFullMore(e,$("[mouseId='"+mouseId+"']").eq(index+1));
							menu_hasMore(index+1,$target,$chosens);
						}
					},
					"mousedown contextmenu" : function(e){
						e.stopPropagation();
						e.preventDefault();
					},
					"click" : removeMenu
				},"li");
			}

			//菜单定位且防止菜单超出屏幕
			function showFullMouseR(e){
				var $mouse = $("[mouseId='"+mouseId+"']:eq(0)"),
					mouseTop,menuHeight = $mouse.height()+10;

				if($(window).height()-e.pageY < menuHeight){    
					mouseTop = $(window).height() - menuHeight;
				}else{
					mouseTop = e.pageY;
				}
				
				var mouseLeft,menuWidth = $mouse.width()+10;

				if($(window).width()-e.pageX < menuWidth){
					mouseLeft = $(window).width()-menuWidth;
				}else{
					mouseLeft = e.pageX;
				}
				$mouse.css({"left":mouseLeft+"px","top":mouseTop+"px"});
			}

			//二、三级菜单定位且防止菜单超出屏幕
			function showFullMore(e,$menu){
				var menuLeft,menuTop;    //菜单left,top
					$this = $(e.target),
					$li = $this.closest("li"),
					$mouse = $this.parents("ul"),
					mouseRight = $mouse.offset().left+ $mouse.width();
				
				//菜单top
				var menuHeight = $menu.height();
				if($(window).height()-e.pageY < menuHeight){
					menuTop = $(window).height() - menuHeight;
				}else{
					menuTop = $li.offset().top-2;
				}
				
				//菜单left
				var menuWidth = $menu.width();
				if($(window).width()-mouseRight < menuWidth){
					menuLeft = $li.offset().left - menuWidth;
				}else{
					menuLeft = mouseRight;
				}
				$menu.css({"left":menuLeft+"px","top":menuTop+"px"});
			}
		},

		moveSelect : function(opts){
			
			var startX, startY;     //起始x,y坐标

			this.off(".box").on({
				"mousedown.box" : function(e){
					if(e.which==1){     //左键 
						$("#selectDiv").remove();
						$(this).append("<div id='selectDiv' style='left:"+(startX = e.pageX)+"px;top:"+(startY = e.pageY)+"px;'></div>");
					}
					e.stopPropagation();
					e.preventDefault();
				},
				"mousemove.box" : function(e){
					var $selectDiv,
						pageX = e.pageX,
						pageY = e.pageY;

					if(e.which==1 && ($selectDiv=$("#selectDiv")).length){     //按住左键移动

						$selectDiv.css({
							"left":Math.min(pageX,startX)+"px",
							"top":Math.min(pageY,startY)+"px",
							"width":Math.abs(pageX-startX)+"px",
							"height":Math.abs(pageY-startY)+"px"
						}).show();

						_moveSelect($selectDiv,$(this).find(opts.children));
					}
				},
				"mouseup.box" : function(e){
					e.which==1 && $("#selectDiv").remove();
				}
			});
			
			$(window.top.document).off(".box").on("mouseup.box",function(){
				$("#selectDiv").remove();
			});

			return this;

			//框选选中
			function _moveSelect($selectDiv,$objects){
				//框选框的上下左右定位
				var selectLeft = $selectDiv.offset().left,
					selectRight = selectLeft + $selectDiv.width(),
					selectTop = $selectDiv.offset().top,
					selectBottom = selectTop + $selectDiv.height();

				//文件的上下左右定位
				$objects.each(function(i){
					var $this = $(this),
						fileLeft = $this.offset().left,
						fileRight = fileLeft + $this.outerWidth(),
						fileTop = $this.offset().top,
						fileBottom = fileTop + $this.outerHeight();

					//文件右>框选左  && 文件左<框选右 && 文件底>框选顶  && 文件顶 < 框选底
					$this.toggleClass(opts.chosenClass,fileRight>selectLeft && fileBottom>selectTop && fileLeft<selectRight && fileTop<selectBottom);
				});
					
			}
		},

		//总入口
		windows : function(args){
			var defaults = {
					children : "div",
					itemMenu : "",
					smallMenu : "",
					blankMenu : "",
					chosenClass : "chosen"
				},
				opts = $.extend({},defaults,args);
			return this.mouseSelect(opts).mouseMenu(opts).moveSelect(opts);
		}
	});
	
})(jQuery);
