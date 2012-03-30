/**
 * Mootools based grid
 * By Davsket / Monoku
 */
var Grid = new Class({
    //Initialization via options object
    //and fires events: 'show'
    Implements: [Options, Events],
    Binds: ['elemClicked'],

    //Options configuration
    options: {
        //The grid selector
        selectorGrid: '[data-monoku-grid]',
        //The element selector
        selectorElems: '.elem',
        //The open element class
        openClass: 'open'
    },

    //Number of columns in the grid
    _cols: 1,
    //The grid element
    _grid: null,
    //The elements in the grid
    _elems: null,
    //The elements width
    _elemsWidth: null,
    //The elements height
    _elemsHeight: null,

    initialize: function(options) {
        var top;
        this.setOptions(options);
        
        //Info gathering
        this._grid = $$(this.options.selectorGrid)[0];
        this._elems = this._grid.getElements(this.options.selectorElems);
        if(this._elems.length){
            this._elemsWidth = this._elems[0].getSize().x;
            this._elemsHeight = this._elems[0].getSize().y;
        }
        top = this._elems[0].getPosition().y;
        while (top == this._elems[this._cols].getPosition().y) this._cols++;
        
        //Initialization
        this._elems.each(function(elem, index){
            var top = elem.getPosition(elem.getParent()).y, 
                left = elem.getPosition(elem.getParent()).x;
            elem.store('top', top);
            elem.store('left', left); 
            elem.store('index', index); 
        });
        this._elems.each(function(elem){
            elem.setStyles({top: elem.retrieve('top'), left: elem.retrieve('left'), position: 'absolute'});
        });
        
        //Events
        this._grid.addEvent('click:relay(' + this.options.selectorElems + ')', this.elemClicked);
    },

    elemClicked: function(evt) {
        evt.stop();
        this._elems.removeClass('open');

        this._calculate(evt.target);
        
        if(this.options.animateElements){
            this.options.animateElements(this._elems, evt.target);
        }else{
            this._moveElements(evt.target);
        }

        this.fireEvent('show');
        return false;
    },

    _calculate: function(source){
        var openCols, openRows,
            index = source.retrieve('index'),
            si = index % this._cols,
            sj = Math.floor(index / this._cols),
            i, j, k,
            cache = {};

        source.addClass('open');

        openCols = Math.ceil(source.getSize().x/this._elemsWidth);
        openRows = Math.ceil(source.getSize().y/this._elemsHeight);
        si = si+openCols-1 >= this._cols ? this._cols-openCols : si; 

        source.removeClass('open');

        for(i=si; i<si+openCols; i++){
            for(j=sj; j<sj+openRows; j++){
                cache[i+':'+j]=true;
            }
        }

        i=j=0;
        for(k=0; k<this._elems.length; k++){
            if(k==index){
                source.store('left', si*this._elemsWidth);
                source.store('top', sj*this._elemsHeight); 
            }else{
                while(cache[i+':'+j]){
                    i++;
                    if(i>=this._cols){
                        i=0;
                        j++;
                    } 
                }
                cache[i+':'+j] = true;  
                this._elems[k].store('left', i*this._elemsWidth);
                this._elems[k].store('top', j*this._elemsHeight);
            }
        }
    },

    _moveElements: function(target){
        var i, morph, length = this._elems.length;
        
        function Group(elems, target){
            this._elems = elems;
            this.length = this._elems.length;
            this.target = target;

            this.onComplete = function(){
                if(length==1){
                    this.target.addClass('open');
                    // this.target.morph({opacity:[0,1]});
                }
                length--;
            };
        };

        var leGroup = new Group(this._elems.length, target);

        for(i=0; i<this._elems.length; i++){
            morph = new Fx.Morph(this._elems[i], {duration: 300, onComplete: leGroup.onComplete.bind(leGroup)});
            morph.start({left: this._elems[i].retrieve('left'), top: this._elems[i].retrieve('top')});
        }
    }

});