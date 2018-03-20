/**
 * @author 박해원
 * @date 20170907
 * @description
 *  - hw swipe
 */
export interface BaseInterface {
    cbz: Function<String>;
    setStyle: Function<Element,Object>;
    setPox: Function<Number>;
    getEasing: Function<Boolean,Number>;
    getListWidth: Function;
    getContainerWidth: Function;
    getTranslateX: Function;
}