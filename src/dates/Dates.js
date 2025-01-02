export const GT = 1;
export const EQ = 0;
export const LT = -1;

export const compareDates = (d1, d2) => {
    if (d1.getFullYear() > d2.getFullYear()) {
        return GT;
    }
    if (d1.getFullYear() < d2.getFullYear()) {
        return LT;
    }

    if (d1.getMonth() > d2.getMonth()) {
        return GT;
    }
    if (d1.getMonth() < d2.getMonth()) {
        return LT;
    }

    if (d1.getDate() > d2.getDate()) {
        return GT;
    }
    if (d1.getDate() < d2.getDate()) {
        return LT;
    }

    return EQ;
}
