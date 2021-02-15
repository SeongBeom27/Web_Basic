var f = function() {
    console.log(1 + 1);
    console.log(1 + 2);
}

console.log(f);
f();

// 배열의 원소로써 함수가 존재할 수 있고
var a = [f];
a[0]();

// 객체로써 함수가 존재할 수 있다.
// 객체에 함수를 담는 일이 매우 많다.
var o = {
    func: f
}

o.func();