/*--------------------- jquerry share -------------------------*/

/**
 * jQuery.share - social media sharing plugin
 * ---
 * @author Carol Skelly (http://in1.com)
 * @version 1.0
 * @license MIT license (http://opensource.org/licenses/mit-license.php)
 * ---
 */

//(function ( $, window, undefined ) {
   
var LoadshareButtons =  function sharebuttons(roomname){ 
    
    DEBUG && console.log(" Social networking sharing options ");

    var document = window.document;

    $.fn.share = function(method) {
 
        var methods = {

            init : function(options) {
                this.share.settings = $.extend({}, this.share.defaults, options);
                var settings = this.share.settings,
                    networks = this.share.settings.networks,
                    theme = this.share.settings.theme,
                    orientation = this.share.settings.orientation,
                    affix = this.share.settings.affix,
                    margin = this.share.settings.margin,
                    pageTitle = this.share.settings.title||$(document).attr('title'),
                    pageUrl = this.share.settings.urlToShare||$(location).attr('href'),
                    pageDesc = "";
                
                //console.log(" Room  ", roomname);

                $.each($(document).find('meta[name="description"]'),function(idx,item){
                    pageDesc = $(item).attr("content");
                });
                
                // each instance of this plugin
                return this.each(function() {
                    var $element = $(this),
                        id=$element.attr("id"),
                        u=encodeURIComponent(pageUrl),
                        t=encodeURIComponent(pageTitle),
                        d=pageDesc.substring(0,250),
                        href;
                    //u ="Page URL for TangoFX", TFXgetRoom;
                    
                    //just instructions
                    //t ="Join the TangoFX at "+ roomname;
                    
                    //auto chomre open content injection 
                    //t= "{TangoFXroom:"+roomname+":TangoFXend}";
                    
                    //regex way of determing room content injection 
                    //t="tfx:"+roomname;
                    
                    //give URL for opeininga html page and injecting script inside it 
                    //var newURL = 'chrome-extension://'+broPlugId+'/src/browser_action/SettingsPage.html';
                    //chrome.tabs.create({ url: newURL });
                    //t="http://tangofxsessions.com?session="+roomname;
                    //t="<html><head><title>My title</title></head><body>"+roomname+"</body></html>";
                    //t='<a href="file:///home/altanaibisht/Dropbox/Work/tangofxsessionsshare.html?broplugid=dscfusgcusa&roomname=iuwci">TFX</a>';
                    //t='file:///home/altanaibisht/Dropbox/Work/tangofxsessionsshare.html?broplugid='+broPlugId+'&roomname='+roomname;

                    if(localStorage.getItem('shorturl')!=null){
                            t=localStorage.getItem('shorturl');
                            u=localStorage.getItem('shorturl');
                    }
                    else{
                            t='https://tfxserver.above-inc.com/static/tangofxsessionsshare.html?broplugid='+broPlugId+'&roomname='+roomname;
                            u='https://tfxserver.above-inc.com/static/tangofxsessionsshare.html?broplugid='+broPlugId+'&roomname='+roomname;
                    }


                    //d ="Welcom to TangoFX at "+ roomname;
                    //d="{TangoFXroom:"+roomname+":TangoFXend}";

                    // append HTML for each network button
                    for (var item in networks) {
                        item = networks[item];
                        href = helpers.networkDefs[item].url;
                        href = href.replace('|u|',u).replace('|t|',t).replace('|d|',d)
                                   .replace('|140|',t.substring(0,130));
                        $("<a href='"+href+"' title='Share this page on "+item+
                            "' class='pop share-"+theme+" share-"+theme+"-"+item+"'></a>")
                            .appendTo($element);
                    }
                    
                    // customize css
                    $("#"+id+".share-"+theme).css('margin',margin);
                    
                    if (orientation != "horizontal"){
                        $("#"+id+" a.share-"+theme).css('display','block');
                    }
                    else {
                        $("#"+id+" a.share-"+theme).css('display','inline-block');
                    }
                    
                    if (typeof affix != "undefined"){
                        $element.addClass('share-affix');
                        if (affix.indexOf('right')!=-1){
                            $element.css('left','auto');
                            $element.css('right','0px');
                            if (affix.indexOf('center')!=-1){
                                $element.css('top','40%');
                            }
                        }
                        else if (affix.indexOf('left center')!=-1){
                            $element.css('top','40%');
                        }
                        
                        if (affix.indexOf('bottom')!=-1){
                            $element.css('bottom','0px');
                            $element.css('top','auto');
                            if (affix.indexOf('center')!=-1){
                                $element.css('left','40%');
                            }
                        }
                    }
                    
                    // bind click
                    $('.pop').click(function(){
                        console.log(" $(this).attr('href')" , $(this).attr('href'));
                        console.log(" t ", t);

                        window.open($(this).attr('href'),'t','toolbar=0,resizable=1,status=0,width=640,height=528');
                        return false;
                    });
                    
                    
                });// end plugin instance
            
            }        
        }

        var helpers = {
            networkDefs: {
                facebook:{url:'http://www.facebook.com/share.php?u=|u|'},

                //http://twitter.com/home?status=jQuery%20Share%20Social%20Media%20Plugin%20-%20Share%20to%20multiple%20social%20networks%20from%20a%20single%20form%20http://plugins.in1.com/share/demo
                //twitter:{url:'https://twitter.com/share?url=|u|&text=|140|'},
                //twitter:{url:'https://twitter.com/share?text=|140|'},
                twitter:{url:'https://twitter.com/share?text=|u|'},

                linkedin:{url:'http://www.linkedin.com/shareArticle?mini=true&url=|u|&title=|t|&summary=|d|&source=in1.com'},
                
                in1:{url:'http://www.in1.com/cast?u=|u|',w:'490',h:'529'},
                
                tumblr:{url:'http://www.tumblr.com/share?v=3&u=|u|'},
                
                digg:{url:'http://digg.com/submit?url=|u|&title=|t|'},
                
                googleplus:{url:'https://plusone.google.com/_/+1/confirm?hl=en&url=|u|'},
                //googleplus:{url:'https://plusone.google.com/_/+1/confirm?hl=en&url=|140|'},
                
                reddit:{url:'http://reddit.com/submit?url=|u|'},
                
                pinterest:{url:'http://pinterest.com/pin/create/button/?url=|u|&media=&description=|d|'},
                
                posterous:{url:'http://posterous.com/share?linkto=|u|&title=|t|'},
                
                stumbleupon:{url:'http://www.stumbleupon.com/submit?url=|u|&title=|t|'},
                
                //email:{url:'mailto:?subject=|t|'}
                email:{url:'mailto:?subject=Please%20Join%20the%20Room&body=|t|'}
            }
        }
     
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error( 'Method "' +  method + '" does not exist in social plugin');
        }

    }

    $.fn.share.defaults = {
        networks: ['facebook','twitter','linkedin'],
        theme: 'icon', // use round icons sprite
        autoShow: true,
        margin: '3px',
        orientation: 'horizontal',
        useIn1: false
    }

    $.fn.share.settings = {}
 }      
/*})(jQuery, window);*/