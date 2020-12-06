// Javascript is problematic when using decimals. So when we need to work with
// fractions, we use this class
export class Fraction {
    numerator: number
    denominator: number

    constructor(n: number, d: number) {
        this.numerator = n
        this.denominator = d
    }
}