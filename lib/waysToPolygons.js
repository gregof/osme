module.exports = function (waysList, ways) {
    var resolvedWaysList = [];
    waysList.forEach(function (wayID) {
        resolvedWaysList.push(ways[wayID].nodes);
    })
    
    var polygons = [];
    while (resolvedWaysList.length) {
        polygons.push(getNextLoop(resolvedWaysList));
    }

    return polygons;
}

function getNextLoop (waysList) {
    var loop = [];

    var first = waysList.shift();
    var next = getNextWay(waysList, first[first.length - 1], first[0]);

    if (!next) {
        // это контур из одного отрезка
        return first.slice();
    }

    // если следующий отрезок прицепился к голове первого, разворачиваем первый
    loop.push.apply(loop, next.byHead ? first.slice().reverse() : first);

    while (next) {
        loop.push.apply(loop, next.nodes);
        next = getNextWay(waysList, loop[loop.length - 1]);
    }
    
    return loop;
}

function getNextWay (waysList, prevTail, prevHead) {
    var nextIndex = -1;
    var byHead = false;
    var needReverse = false;

    for (var i = 0, nodes, isNext = false; nodes = waysList[i]; i++) {

        if (isEqualPoint(prevTail, nodes[0])) {
            isNext = true;
        } else if (isEqualPoint(prevTail, nodes[nodes.length - 1])) {
            isNext = true;
            needReverse = true;
        }

        if (!isNext && prevHead) {
            if (isEqualPoint(prevHead, nodes[0])) {
                byHead = true;
                isNext = true;
            } else if (isEqualPoint(prevHead, nodes[nodes.length - 1])) {
                byHead = true;
                isNext = true;
                needReverse = true;
            }
        }

        if (isNext) {
            nextIndex = i;
            break;
        }

    }

    if (nextIndex != -1) {
        var nodes = waysList[nextIndex];
        waysList.splice(nextIndex, 1);
        return {
            nodes: needReverse ? nodes.slice().reverse() : nodes.slice(),
            byHead: byHead
        }
    } else {
        return null;
    }

}

function isEqualPoint (p1, p2) {
    return p1[0] === p2[0] && p1[1] === p2[1];
}