const height = $('#canvas').attr('height')
const width  = $('#canvas').attr('width')
var duration = 1750
var interval = 200
var statistics = true;

var s = Snap('#canvas')

function Board(rows, params) {
    this.rows = rows
    this.params = params
}

Board.prototype = {
    getStartPoint: function() {
        return {
            x: width/2,// - this.params.distX()/2,
            y: this.params.paddingY
        }
    },
    createHandle: function(x, y) {
        var c = s.circle(x, y, this.params.handleOuter)
        c.attr({fill: this.params.handleOuterFill})
        c = s.circle(x, y, this.params.handleInner)
        c.attr({fill: this.params.handleInnerFill})
        c = s.circle(x, y, this.params.handleMin)
        c.attr({fill: this.params.handleMinFill})
    },
    pyramid: function() {
        const distX = this.params.distX()
        const distY = this.params.distY()
        
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < i + 2; j++) {
                this.createHandle(width/2 + j*distX - distX*(i+1)/2, this.params.paddingY + i*distY)
            }
        }            
    },
    halfDown: function(point) {
            point.y = point.y + this.params.distY()/2
            return ('L' + ' ' + point.x + ' ' + point.y + ' ')
    },
    left: function(point) {
            var path = ('M ' + (point.x) + ' ' + (point.y))
            const distX = this.params.distX()
            const distY = this.params.distY()
            path +=('Q ' +
               (point.x - distX/2) + ' ' +
               (point.y) + ' ' +
               (point.x - distX/2) + ' ' +
               (point.y + distY/2))
            point.x -= distX/2
            point.y += distY/2
            return path;
    },
    right: function(point) {
            var path = ('M ' + (point.x) + ' ' + (point.y))
            const distX = this.params.distX()
            const distY = this.params.distY()
            path +=('Q ' +
               (point.x + distX/2) + ' ' +
               (point.y) + ' ' +
               (point.x + distX/2) + ' ' +
               (point.y + distY/2))
            point.x += distX/2
            point.y += distY/2
            return path;
    },
    fullPath: function(arr, startPoint) {
            var path = ('M' + startPoint.x + ' ' + startPoint.y)
            path += this.halfDown(startPoint)
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] == 0) {
                    path += this.left(startPoint)
                }
                else path += this.right(startPoint)
                path += this.halfDown(startPoint)
            }
            return path;
    },
    simulatePath: function() {
        var arr = [];
        var total = 0;
        for (var i = 0; i < this.rows - 1; i++) {
            if (Math.random() < 0.5) arr.push(0)
            else {
                arr.push(1)
                total++;
            }
        }
        return {pathArray : arr, landing : total}
    },
    runOne: function() {
        var startPoint = this.getStartPoint();
        
        var simulation = this.simulatePath()
        var pathString =  this.fullPath(
            simulation.pathArray,
            startPoint
        )
        var path = s.path(pathString).attr({fill: 'transparent', stroke:'transparent'})
        var c = s.circle(0, 0, this.params.handleOuter)
        this.animatePath(c, path, simulation.landing)
        
        
    },
    runMany: function(n){
        for (var i = 0; i < n; i++) {
            setTimeout(this.runOne.bind(this), interval*i) 
        }
    },
    animatePath: function (object, path, blockIndex) {
        Snap.animate(0, Snap.path.getTotalLength(path), function(step){
                moveToPoint = Snap.path.getPointAtLength(path, step);
                x = moveToPoint.x;
                y = moveToPoint.y;
                object.transform( 'translate(' + x + ',' + y + ')' );
        }, duration, function() {
            path.remove();
            object.remove();
            if (statistics) {
                stats.updateBlock(blockIndex)
            }
        } );
        
    }     
};

var params =  {
        handleOuter : 8,
        handleOuterFill : '#fc0',
        handleInner : 4,
        handleInnerFill : '#cf0',
        handleMin : 2,
        handleMinFill : '#0cf',
        xSpaceFactor: 4,
        ySpaceFactor: 4,
        distX: function() {return this.handleOuter * this.xSpaceFactor},
        distY: function() {return this.handleOuter * this.ySpaceFactor},
        paddingY : 50
};
var board = new Board(20, params);


board.pyramid()
makeStats()
$('#canvas').click(function() {
    board.runMany(100)
})

function makeStats() {
    arr = [];
    const yLevelPadding = 10;    
    var yLevel = board.params.handleOuter + board.params.distY()*(board.rows-1) +  board.params.paddingY + yLevelPadding
    var xLevel = board.getStartPoint().x - board.params.distX()/2*(board.rows-1) + board.params.handleOuter -board.params.distX()/2
    for (var i = 0; i < board.rows; i++) {
        arr.push(
            s.rect(xLevel + (board.params.distX()/2 + this.params.handleOuter*2) * i,
                   yLevel,
                   board.params.handleOuter*2,
                   0
            )
        )
    }
    
    function update(index) {
        arr[index].attr('height', parseInt(arr[index].attr('height')) + 1) 
    } 
    return {
        blocks: arr,
        updateBlock: update
    }
    
}

var stats = makeStats()