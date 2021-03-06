/**
 * @author 박해원
 * @date 20170907
 * @description
 *  - hw swipe
 */
export function override(container, key, other1) {
  var baseType = Object.getPrototypeOf(container);
  if(typeof baseType[key] !== 'function') {
    throw new Error('Method ' + key + ' of ' + container.constructor.name + ' does not override any base class method');
  }
}
