export function rewriteURL(rewriteRules, url) {
  for (let i = 0; i < rewriteRules.length; i++) {
    let rewriteRule = rewriteRules[i];
    if (Array.isArray(rewriteRule)) {
      let tmpUrl = url;
      for (let j = 0; j < rewriteRule.length; j++) {
        let reg = new RegExp(rewriteRule[j].reg);
        let replace = rewriteRule[j].replace;
        let optional = rewriteRule[j].optionalMatch;
        let lastRule = j === rewriteRule.length - 1;
        if (tmpUrl.match(reg) && lastRule) {
          return tmpUrl.replace(reg, replace);
        } else if (tmpUrl.match(reg)) {
          tmpUrl = tmpUrl.replace(reg, replace);
        } else if (!optional) {
          break;
        } else if (optional && lastRule) {
          return tmpUrl;
        }
      }
    } else {
      let reg = new RegExp(rewriteRule.reg);
      if (url.match(reg)) {
        return url.replace(reg, rewriteRule.replace);
      }
    }
  }
  return null;
}
