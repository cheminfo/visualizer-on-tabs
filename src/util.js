

export function rewriteURL(rewriteRules, url) {
    for (let i = 0; i < rewriteRules.length; i++) {
        var rewriteRule = rewriteRules[i];
        let reg = new RegExp(rewriteRule.reg);
        if(url.match(reg)) {
            return url.replace(reg, rewriteRule.replace);
        }
    }
    return null;
}

