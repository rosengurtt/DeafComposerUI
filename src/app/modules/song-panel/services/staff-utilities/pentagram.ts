import { BasicShapes } from './basic-shapes'
import { TimeSignature } from 'src/app/core/models/time-signature'
import { Bar } from 'src/app/core/models/bar'
import { Notes } from './notes'
import { KeySignature } from 'src/app/core/models/key-signature'

export abstract class Pentagram {

    public static drawPentagram(g: Element, length: number): void {
        BasicShapes.drawPath(g, 'black', 1, `M 5,52 H ${length}`)
        BasicShapes.drawPath(g, 'black', 1, `M 5,64 H ${length}`)
        BasicShapes.drawPath(g, 'black', 1, `M 5,76 H ${length}`)
        BasicShapes.drawPath(g, 'black', 1, `M 5,88 H ${length}`)
        BasicShapes.drawPath(g, 'black', 1, `M 5,100 H ${length}`)

        BasicShapes.drawPath(g, 'black', 1, `M 5,152 H ${length}`)
        BasicShapes.drawPath(g, 'black', 1, `M 5,164 H ${length}`)
        BasicShapes.drawPath(g, 'black', 1, `M 5,176 H ${length}`)
        BasicShapes.drawPath(g, 'black', 1, `M 5,188 H ${length}`)
        BasicShapes.drawPath(g, 'black', 1, `M 5,200 H ${length}`)
    }
    // We draw the time signature in a bar if it is the first bar or if the time signature is different from the
    // previous bar
    public static mustDrawTimeSignature(barNumber: number, bars: Bar[]): boolean {
        if (barNumber == 1) return true
        const previousTimeSig = bars[barNumber - 2].timeSignature
        const currentTimeSig = bars[barNumber - 1].timeSignature
        if (previousTimeSig.numerator == currentTimeSig.numerator &&
            previousTimeSig.denominator == currentTimeSig.denominator)
            return false
        return true
    }
    public static mustDrawKeySignature(barNumber: number, bars: Bar[]): boolean {
        if (barNumber == 1) return true
        const previousKeySig = bars[barNumber - 2].keySignature
        const currentKeySig = bars[barNumber - 1].keySignature
        if (previousKeySig.key == currentKeySig.key)
            return false
        return true
    }
    // Returns the space it took in the drawing
    public static drawTimeSignature(g: Element, x: number, timeSignature: TimeSignature): number {
        BasicShapes.createText(g, timeSignature.numerator.toString(), x + 10, 68, 30, 'black', null, 'bold')
        BasicShapes.createText(g, timeSignature.denominator.toString(), x + 10, 105, 28, 'black', null, 'bold')

        BasicShapes.createText(g, timeSignature.numerator.toString(), x + 10, 168, 30, 'black', null, 'bold')
        BasicShapes.createText(g, timeSignature.denominator.toString(), x + 10, 205, 28, 'black', null, 'bold')
        return 50
    }

    public static drawBarLine(svgBox: Element, x: number): number {
        BasicShapes.drawPath(svgBox, 'black', 2, `M ${x + 10},20 V 100 z`)
        return 50
    }
    public static drawBarNumber(g: Element, x: number, barNumber: number): number {
        BasicShapes.createText(g, barNumber.toString(), x, 150, 80, 'blue', null, null, 0.2)
        return 50
    }


    public static drawClefs(g: Element, x: number): number {
        this.drawGclef(g)
        this.drawFclef(g)
        return 55
    }


    private static drawGclef(g: Element) {
        const path = "M 25.549,964.001 C 101.96,964.846 99.8204,966.272 98.13,968.28 96.4394,970.287 95.4093,972.48 95.0395,974.857 94.6697,977.234 94.9735,979.585 95.9508,981.909 96.9281,984.234 98.7639,986.109 101.458,987.536 102.092,987.536 102.488,987.8 102.647,988.328 102.805,988.856 102.567,989.12 101.934,989.12 99.345,988.592 97.0734,987.509 95.1188,985.872 91.4736,982.86 89.4662,978.978 89.0964,974.223 88.8851,971.846 89.1096,969.548 89.77,967.329 90.4303,965.11 91.3416,963.076 92.5038,961.227 93.9301,959.273 95.6206,957.582 97.5753,956.156 97.6809,956.05 97.9847,955.813 98.4865,955.443 98.9884,955.073 99.477,954.73 99.9525,954.413 100.428,954.096 101.141,953.594 102.092,952.907 L 99.1601,938.802 C 96.5715,940.968 94.0094,943.358 91.4737,945.973 88.9379,948.588 86.6399,951.349 84.5796,954.254 82.5194,957.16 80.8685,960.237 79.627,963.486 78.3856,966.735 77.7649,970.155 77.7649,973.748 77.7649,977.076 78.4648,980.206 79.8648,983.138 81.2647,986.07 83.1269,988.619 85.4513,990.784 87.7757,992.95 90.4567,994.654 93.4943,995.896 96.5319,997.137 99.6091,997.758 102.726,997.758 102.832,997.758 103.32,997.705 104.192,997.599 105.064,997.494 105.988,997.362 106.965,997.203 107.943,997.045 108.841,996.873 109.66,996.688 110.478,996.503 110.888,996.305 110.888,996.094 L 110.412,993.875 C 108.352,983.468 106.397,973.51 104.549,964.001 z M 107.322,963.684 113.82,995.143 C 117.571,993.716 120.106,991.273 121.427,987.813 122.748,984.353 123.051,980.84 122.338,977.274 121.625,973.708 119.948,970.551 117.306,967.804 114.665,965.057 111.337,963.684 107.322,963.684 z M 99.0016,921.29 C 100.639,920.444 102.158,919.177 103.558,917.486 104.958,915.796 106.252,913.986 107.441,912.058 108.629,910.13 109.66,908.162 110.531,906.154 111.403,904.147 112.103,902.325 112.631,900.687 113.212,898.944 113.608,896.989 113.82,894.823 114.031,892.657 113.688,890.835 112.79,889.355 112.156,888.035 111.324,887.269 110.294,887.057 109.263,886.846 108.233,886.925 107.203,887.295 106.173,887.665 105.196,888.259 104.271,889.078 103.347,889.897 102.673,890.623 102.251,891.257 101.088,893.317 100.071,895.615 99.1997,898.151 98.328,900.687 97.7337,903.315 97.4168,906.036 97.0998,908.756 97.0602,911.371 97.2979,913.881 97.5356,916.39 98.1035,918.86 99.0016,921.29 z M 96.6244,923.746 C 95.7263,920.26 94.9339,916.839 94.2471,913.484 93.5603,910.13 93.217,906.683 93.217,903.143 93.217,900.555 93.4019,897.715 93.7717,894.625 94.1414,891.535 94.815,888.523 95.7923,885.591 96.7696,882.659 98.1167,880.031 99.8336,877.707 101.551,875.382 103.835,873.692 106.688,872.635 106.952,872.53 107.216,872.477 107.48,872.477 107.85,872.477 108.286,872.688 108.788,873.111 109.29,873.533 109.818,874.154 110.373,874.973 110.927,875.792 111.416,876.637 111.839,877.509 112.261,878.38 112.578,878.975 112.79,879.292 114.216,881.986 115.259,884.852 115.92,887.889 116.58,890.927 116.963,893.951 117.069,896.962 117.28,901.506 117.029,905.996 116.316,910.434 115.603,914.871 114.163,919.203 111.997,923.429 111.258,924.697 110.505,925.978 109.739,927.272 108.973,928.567 108.062,929.821 107.005,931.036 106.794,931.248 106.411,931.631 105.856,932.185 105.301,932.74 104.733,933.308 104.152,933.889 103.571,934.47 103.056,935.012 102.607,935.513 102.158,936.015 101.934,936.319 101.934,936.425 L 105.182,952.273 C 105.203,952.377 106.807,952.273 106.807,952.273 109.907,952.312 113.189,952.814 116.039,953.937 118.786,955.205 121.15,956.948 123.131,959.167 125.112,961.386 126.696,963.882 127.885,966.655 129.074,969.429 129.668,972.242 129.668,975.095 129.668,977.947 129.245,980.853 128.4,983.811 126.234,989.411 122.774,993.558 118.02,996.252 117.491,996.569 116.738,996.926 115.761,997.322 114.784,997.718 114.401,998.339 114.612,999.184 115.88,1004.94 116.738,1008.9 117.188,1011.07 117.637,1013.24 117.967,1016.04 118.178,1019.47 118.389,1022.75 117.821,1025.7 116.474,1028.34 115.127,1030.99 113.318,1033.14 111.046,1034.8 108.775,1036.47 106.701,1037.44 104.826,1037.74 102.95,1038.03 101.669,1038.17 100.983,1038.17 98.6054,1038.17 96.281,1037.72 94.0094,1036.82 91.2095,1035.77 88.8587,1034.16 86.9569,1031.99 85.0551,1029.82 84.1042,1027.18 84.1042,1024.07 84.1042,1022.11 84.6721,1020.1 85.8079,1018.04 86.9437,1015.98 88.4361,1014.5 90.285,1013.61 92.3453,1012.55 94.2075,1012.26 95.8716,1012.73 97.5356,1013.21 98.9091,1014.11 99.9921,1015.43 101.075,1016.75 101.828,1018.35 102.251,1020.22 102.673,1022.1 102.647,1023.85 102.171,1025.49 101.696,1027.13 100.732,1028.52 99.279,1029.65 97.8262,1030.79 95.8055,1031.3 93.217,1031.2 94.2735,1033.1 95.7527,1034.3 97.6545,1034.8 99.5563,1035.31 101.511,1035.34 103.518,1034.92 105.526,1034.5 107.414,1033.72 109.184,1032.58 110.954,1031.45 112.341,1030.22 113.344,1028.9 113.978,1027.95 114.454,1026.71 114.771,1025.18 115.088,1023.64 115.273,1022.05 115.325,1020.38 115.378,1018.72 115.325,1017.42 115.167,1016.5 115.008,1015.57 114.744,1014.13 114.374,1012.18 112.79,1005.79 111.786,1001.77 111.363,1000.13 111.152,999.607 110.584,999.435 109.66,999.62 108.735,999.805 107.956,999.977 107.322,1000.13 102.779,1000.72 98.9752,1000.45 95.9112,999.343 91.1567,998.075 86.9701,995.816 83.3514,992.567 79.7327,989.319 76.8272,985.383 74.6348,980.76 72.4425,976.138 71.3463,972.625 71.3463,970.221 71.3463,967.818 71.3463,966.299 71.3463,965.665 71.3463,961.386 72.0859,957.371 73.5651,953.62 76.3649,947.756 79.6799,942.368 83.5099,937.455 87.3399,932.542 91.7114,927.972 96.6244,923.746 z"
        const style = "fill:#000000;stroke:none;"
        let clef = BasicShapes.drawPath(g, 'black', 0, path, style)
        clef.setAttributeNS(null, 'transform', 'translate(-35,-500) scale(0.6 0.6)')
    }

    private static drawFclef(g: Element) {
        const path = "m 62.511677,127.84048 c 0,-0.83977 4.041963,-4.29526 8.982141,-7.67885 10.621365,-7.27471 18.291956,-15.2339 22.753427,-23.609504 10.231245,-19.207279 6.990215,-39.234197 -6.645392,-41.063116 -7.541825,-1.01157 -17.090176,4.491435 -17.090176,9.84959 0,1.98778 0.508501,2.147884 6.037438,1.900912 6.764925,-0.302182 11.341654,6.282702 7.680759,11.050886 -5.784567,7.53419 -19.718197,3.205925 -19.718197,-6.12515 0,-8.178104 4.976735,-14.686661 13.736031,-17.963933 18.744999,-7.013402 36.588252,5.915889 35.025872,25.379878 -1.28058,15.953347 -15.170703,30.852697 -42.135847,45.197347 -6.39814,3.40362 -8.626056,4.19445 -8.626056,3.06194 z"
        const style = "fill:#000000"
        let clef = BasicShapes.drawPath(g, 'black', 0, path, style)
        BasicShapes.drawEllipse(g, 45, 158, 3, 2, 'black', 2, '', true)
        BasicShapes.drawEllipse(g, 45, 170, 3, 2, 'black', 2, '', true)
        clef.setAttributeNS(null, 'transform', 'matrix(3,0,0,3,15,-150) translate(-15,90) scale(0.2 0.2)')
    }

    private static drawSharpOfKeySignature(g: Element, sharpNo: number, x: number): number {
        let deltaX: number = 11
        let deltaY: number = 0
        switch (sharpNo) {
            case 1:
                deltaY = 81
                break
            case 2:
                deltaY = 101
                break
            case 3:
                deltaY = 75
                break
            case 4:
                deltaY = 95
                break
            case 5:
                deltaY = 111
                break
            case 6:
                deltaY = 89
                break
            case 7:
                deltaY = 106
                break
        }
        Notes.drawSharp(g, x, deltaY - 112)
        return Notes.drawSharp(g, x, deltaY)
    }


    private static drawFlatOfKeySignature(g: Element, flatNo: number, x: number): number {
        let deltaY: number = 0
        switch (flatNo) {
            case 1:
                deltaY = 104
                break
            case 2:
                deltaY = 84
                break
            case 3:
                deltaY = 110
                break
            case 4:
                deltaY = 92
                break
            case 5:
                deltaY = 116
                break
            case 6:
                deltaY = 99
                break
            case 7:
                deltaY = 121
                break
        }
        Notes.drawFlat(g, x, deltaY)
        return Notes.drawFlat(g, x, deltaY - 111)
    }


    public static drawKeySignature(g: Element, x: number, k: KeySignature): number {
        let deltaX = 13
        // sharps
        for (let s = 1; s <= k.key; s++) {
            deltaX += this.drawSharpOfKeySignature(g, s, x + deltaX)
        }
        // flats
        for (let f = 1; f <= -k.key; f++) {
            deltaX += this.drawFlatOfKeySignature(g, f, x + deltaX)
        }
        return deltaX
    }

}