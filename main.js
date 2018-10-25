window.addEventListener('load', function(){

    const inputWrapper = document.querySelector('.money-input-wrapper'),
          field = inputWrapper.querySelector('.money-input-field'),
          interaction = inputWrapper.querySelector('.money-input-interaction'),
          width = interaction.offsetWidth,
          MAX_TRIES = 20,
          COIN_DIST = width * 0.08;

    const currentTweens = [];

    function setCoins(curr){
        curr = curr || 0;

        let prev = Array.from(interaction.children),
            diff = curr - prev.length;

        console.log(curr, diff);

        currentTweens.forEach(tween => tween.reverse());

        if(diff > 0){
            for(let i = 0; i < diff; i++) addNewCoin();
        } else if(diff < 0) {
            prev.slice(diff).forEach(coin => removeCoin(coin));
        }
    }

    function removeCoin(coin){
        let dest = {
            x: coin.getAttribute('data-orig-x'),
            y: coin.getAttribute('data-orig-y'),
        }
        
        let tween = TweenLite.to(coin, .6, { ...dest, ease: Strong.easeInOut, onComplete: function(){
            coin.remove();
            currentTweens.splice(currentTweens.findIndex(e => e === this), 1);
        }});

        currentTweens.push(tween);
    }

    function addNewCoin(){
        let coin = getImage('coin');
        
        let orig = getRandomPosition(true),
            dest = getRandomPositionNoOverlap();

        coin.setAttribute('data-orig-x', orig.x);
        coin.setAttribute('data-orig-y', orig.y);
        coin.setAttribute('data-dest-x', dest.x);
        coin.setAttribute('data-dest-y', dest.y);
        
        let tween = TweenLite.fromTo(coin, .6, orig, { ...dest, 
            ease: Strong.easeInOut, 
            delay: Math.random() * .3,
            onComplete: function(){
                currentTweens.splice(currentTweens.findIndex(e => e === this), 1);
            }
        });

        currentTweens.push(tween);

        interaction.appendChild(coin);
    }

    function getImage(type){
        let img = document.createElement('img');
        img.setAttribute('src', type + '.svg');
        img.setAttribute('class', 'img-' + type);
        return img;
    }

    function getRandomPositionNoOverlap(isOrigin, lastTry){
        let pos = getRandomPosition(isOrigin);
        lastTry = typeof lastTry === 'undefined' ? MAX_TRIES : lastTry;

        let overlap = Array.from(interaction.children).some((elem) => {
            let obj = {
                x: elem.getAttribute('data-dest-x'),
                y: elem.getAttribute('data-dest-y'),
            }
            if(dist(obj, pos) < COIN_DIST) return true;
        });

        if(overlap && lastTry > 0)
            return getRandomPositionNoOverlap(isOrigin, --lastTry);
        else{
            if(lastTry == 0) console.log('reached max');
            return pos;
        }
    }

    function getRandomPosition(isOrigin){
        let angle = Math.random() * Math.PI * 2,
            distance = width*.5 * (isOrigin ? 1.1 : Math.random() - .1),
            offset = width*.5;
        return {
            x: distance * Math.cos(angle) + offset, 
            y: distance * Math.sin(angle) + offset
        };
    }

    const setCoinsDebounced = debounce((value) => setCoins(value), 200);

    field.addEventListener('input', function(e){
        let value = e.target.value;
        let hasError = isNaN(value);
        
        value = parseInt(value);

        inputWrapper.classList[hasError ? 'add' : 'remove']('error');

        if(hasError) return;

        if(value > 100) value = 100;
        setCoinsDebounced(value);
    });

});

// https://davidwalsh.name/javascript-debounce-function
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

// https://www.mathplanet.com/education/algebra-2/conic-sections/distance-between-two-points-and-the-midpoint
function dist(a, b){
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}