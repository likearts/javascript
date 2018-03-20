/**
 * @author 박해원
 * @date 20170907
 * @description
 *  - hw swipe
 */
export default class Easing {
    static cubicbezier(type) {
        var easing = "";
        switch( type ) {
            // Expo
            case "easeInExpo":
                easing = "cubic-bezier(0.950, 0.050, 0.795, 0.035)";
                break;
            case "easeOutExpo":
                easing = "cubic-bezier(0.190, 1.000, 0.220, 1.000)";
                break;
            case "easeInOutExpo":
                easing = "cubic-bezier(1, 0, 0, 1)";
                break;
            // Cubic
            case "easeOutCubic":
                easing = "cubic-bezier(0.215, 0.610, 0.355, 1.000)";
                break;
            // Quart
            case "easeInQuart":
                easing = "cubic-bezier(0.895, 0.030, 0.685, 0.220)";
                break;
            case "easeOutQuart":
                easing = "cubic-bezier(0.165, 0.840, 0.440, 1.000)";
                break;
            case "easeInOutQuart":
                easing = "cubic-bezier(0.77, 0, 0.175, 1)";
                break;
            // Qunit
            case "easeInQunut":
                easing = "cubic-bezier(0.755, 0.050, 0.855, 0.060)";
                break;
            case "easeOutQuint":
                easing = "cubic-bezier(0.230, 1.000, 0.320, 1.000)";
                break;
            case "easeInOutQuint":
                easing = "cubic-bezier(0.860, 0.000, 0.070, 1.000)";
                break;
            // Circ
            case "easeInCirc":
                easing = "cubic-bezier(0.600, 0.040, 0.980, 0.335";
                break;
            case "easeOutCirc":
                easing = "cubic-bezier(0.075, 0.820, 0.165, 1.000)";
                break;
            case "easeInOutCirc":
                easing = "cubic-bezier(0.785, 0.135, 0.150, 0.860)";
                break;
            // Back
            case "easeInBack":
                easing = "cubic-bezier(0.600, 0, 0.735, 0.045)";
                break;
            case "easeOutBack":
                easing = "cubic-bezier(0.175, 0.885, 0.32, 1.275)";
                break;
            case "customBack":
                easing = "cubic-bezier(.16,1,.19,1.19)";
                break;
            case "easeInOutBack":
                easing = "cubic-bezier(0.68, -0.55, 0.265, 1.55)";
                break;
            // Sine
            case "easeInSine":
                easing = "cubic-bezier(0.47, 0, 0.745, 0.715)";
                break;
            case "easeOutSine":
                easing = "cubic-bezier(0.39, 0.575, 0.565, 1)";
                break;
            case "easeInOutSine":
                easing = "cubic-bezier(0.445, 0.05, 0.55, 0.95)";
                break;
            case "easeOutElastic":
                easing = "cubic-bezier(.75,-0.5,0,1.75)";
            default: easing = "cubic-bezier(0.1, 0.57, 0.1, 1)";
        }
        return easing;
    }
}