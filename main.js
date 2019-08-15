const height = 1000
const width  = 1000
duration = 950

var s = Snap('#canvas')

function Board(rows) {
    this.rows = rows
}

Board.prototype = {
    hParams: {
        handleOuter : 16,
        handleOuterFill : '#fc0',
        handleInner : 12,
        handleInnerFill : '#cf0',
        handleMin : 8,
        handleMinFill : '#0cf',
        xSpaceFactor: 4,
        ySpaceFactor: 4,
        distX: function() {return this.handleOuter * this.xSpaceFactor},
        distY: function() {return this.handleOuter * this.ySpaceFactor},
        paddingY : 100
    },
    createHandle: function(x, y) {
        var c = s.circle(x, y, this.hParams.handleOuter)
        c.attr({fill: this.hParams.handleOuterFill})
        c = s.circle(x, y, this.hParams.handleInner)
        c.attr({fill: this.hParams.handleInnerFill})
        c = s.circle(x, y, this.hParams.handleMin)
        c.attr({fill: this.hParams.handleMinFill})
    },
    pyramid: function() {
        const distX = this.hParams.distX()
        const distY = this.hParams.distY()
        
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < i + 2; j++) {
                this.createHandle(width/2 + j*distX - distX*(i+1)/2, this.hParams.paddingY + i*distY)
            }
        }
            
    },
    halfDown: function(point) {
            point.y = point.y + this.hParams.distY()/2
            return ('L' + ' ' + point.x + ' ' + point.y + ' ')
    },
    left: function(point) {
            var path = ('M ' + (point.x) + ' ' + (point.y))
            const distX = this.hParams.distX()
            const distY = this.hParams.distY()
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
            const distX = this.hParams.distX()
            const distY = this.hParams.distY()
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
        for (var i = 0; i < this.rows - 1; i++) {
            if (Math.random() < 0.5) arr.push(0)
            else arr.push(1)
        }
        return arr
    },
    runOne: function() {
        var startPoint = {
            x: width/2,
            y: this.hParams.paddingY
        }
        var pathString =  this.fullPath(
            this.simulatePath(),
            startPoint
        )
//        var path = s.path(pathString).attr({fill: 'transparent', 'stroke-width': 10, stroke:'black'}) //debug
        var path = s.path(pathString).attr({fill: 'transparent', stroke:'transparent'})

        var c = s.circle(0, 0, this.hParams.handleOuter)

        this.animatePath(c, path)
    },
    runMany: function(n){
        for (var i = 0; i < n; i++) {
            setTimeout(this.runOne.bind(this), 100*i) 
        }
    },
    animatePath: function (object, path) {
        Snap.animate(0, Snap.path.getTotalLength(path), function(step){
                moveToPoint = Snap.path.getPointAtLength(path, step);
                x = moveToPoint.x;
                y = moveToPoint.y;
                object.transform( 'translate(' + x + ',' + y + ')' );
        }, duration, function() {path.remove(); object.remove()} );
        
    },
    updateBucket: function(num) {},
    stats: {}
};
var board = new Board(14);
board.pyramid()
$('#canvas').click(function() {
    board.runMany(100)
})

