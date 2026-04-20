let pity5 = 0;
let pity4 = 0;

export function getResult() {
    pity5++;
    pity4++;

    if (pity5 >= 90) return 5;
    if (pity4 >= 10) return 4;

    let r = Math.random();

    if (r < 0.006) return 5;
    if (r < 0.057) return 4;
    return 3;
}