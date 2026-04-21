let pity5 = 0;
let pity4 = 0;

export function getResult() {

    pity5++;
    pity4++;

    // ⭐ 保底
    if (pity5 >= 90) {
        pity5 = 0;
        pity4 = 0;
        return 5;
    }

    if (pity4 >= 10) {
        pity4 = 0;
        return 4;
    }

    let r = Math.random();

    let result;

    if (r < 0.006) result = 5;
    else if (r < 0.057) result = 4;
    else result = 3;

    // ⭐ 命中后重置对应 pity（防连续污染）
    if (result === 5) {
        pity5 = 0;
        pity4 = 0;
    }
    if (result === 4) {
        pity4 = 0;
    }

    return result;
}