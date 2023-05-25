```js
x * pow(2, sin(x + 2 * PI * impulse(1000)));
x * pow(2, sin(x + 2 * PI * impulse(1000 * random())));
x * pow(2, 1 / sin(x + 2 * PI * impulse(1000)));
x * pow(2, 1 / sin(x + 2 * PI * impulse(1000 * random())));
-x * pow(2, sin(-x + 2 * PI * impulse(1000)));
-x * pow(2, sin(-x + 2 * PI * impulse(1000 * random())));
-x * pow(2, 1 / sin(-x + 2 * PI * impulse(1000)));
-x * pow(2, 1 / sin(-x + 2 * PI * impulse(1000 * random())));
```