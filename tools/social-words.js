// tools/social-words.js — mots interdits en mode social (Stake.US), équivalents dans les 16 langues du jeu.
//
// La checklist officielle (liste anglaise, js/social.js → SOCIAL.RESTRICTED) interdit : bet, buy, cash, credit, currency, deposit, fund, withdraw,
// gamble, money, pay / paid / pays, purchase, stake, wager, « cost of »… Pour les autres langues, il n'existe aucune liste officielle : cette liste est
// MA traduction du sens de ces mots (pari/mise, achat, espèces, crédit, devise, dépôt, retrait, jeu d'argent, argent, paiement, coût de…).
// Elle n'a pas été relue par des locuteurs natifs : elle peut oublier un synonyme ou une forme fléchie. Ajoutez-y tout mot qu'un relecteur signale.
//
// Format : par langue, une liste de fragments d'expression régulière (les tests sont insensibles à la casse, NFC).
//  - sans préfixe : le fragment doit COMMENCER un mot (« kauf » trouve « Kauf », « kaufen », mais pas « Hauptkauf » ; fragment suivi de n'importe quelles lettres) ;
//  - préfixé par « * » : le fragment est cherché n'importe où dans le mot (composés allemands, langues agglutinantes, arabe avec ses préfixes, chinois/japonais/coréen sans espaces).
// Choix de vocabulaire (à faire relire) : « coins » ne peut pas s'écrire avec le mot « monnaie / moneda / عملة » quand celui-ci signifie aussi « devise » ;
// les mots « pièces / Münzen / moedas / 金币 / 코인… » sont utilisés pour « coins », « jeton / token / 代币 » pour le jeton.
// Ne sont PAS interdits (autorisés par la checklist ou hors liste) : balance/solde, win/gain, play/jouer, collect/ramasser, coins, token, amount, get/obtenir.
(function (exp) {
  var W = {
    // mots entiers anglais (aussi cherchés dans toutes les autres langues) : SOCIAL.RESTRICTED
    fr: ['mis(?:e|es|er|é|ées?|ez)(?![\\p{L}])', 'pari', 'parie', 'achat', 'ach[eè]t', 'pay(?:er|é|ée|ez|e|es|ent|ant)(?![\\p{L}])', 'paie', 'paiement', 'argent', 'esp[èe]ces', 'encaiss', 'd[ée]p[ôo]t', 'retrait', 'retirer', 'devise', 'cr[ée]dit', 'jeux? d.argent', 'fonds', 'co[ûu]t', 'financ', 'miser'],
    de: ['*einsatz', '*wett', '*kauf', '*bezahl', '*auszahl', '*einzahl', '*zahlt', '*zahlung', '*geld', 'kassier', 'kasse', 'währung', '*abheb', 'glücksspiel', 'zocken', 'kredit', 'guthaben-?aufladung', 'gutschr', 'fonds', '*kosten(?!los)', '*kostet', 'echtgeld'],
    es: ['apuest', 'apost', 'compra', 'compré', 'dinero', 'efectivo', 'cobr(?:a|ar|o|ó|e|es|an)(?![\\p{L}])', 'paga(?:s|n|r|do)?(?![\\p{L}])', 'pagó', 'pagu', 'pago', 'abon(?:a|ar|o|ó)(?![\\p{L}])', 'dep[óo]sito', 'retir(?:o|ar|ada)', 'divisa', 'azar', 'cr[ée]dito', 'fondos', 'cost(?:e|o|ar|a)(?![\\p{L}])'],
    pt: ['apost', 'compr(?:a|ar|o|ei|e|as|ou|ando)(?![\\p{L}])', '*dinheiro', 'pag(?:ar|a|o|ou|ando|amento|ue|uem|aram)(?![\\p{L}])', 'pagamento', 'dep[óo]sit', 'saque', 'sacar', 'câmbio', 'divisa', 'azar', 'cr[ée]dit', 'fundos', 'custo', 'custa'],
    pl: ['zakład', 'zakłada', 'stawk', 'obstaw', 'kup(?![\\p{L}]*ka)', 'kupn', 'zakup', 'płat', 'płac', 'zapła', 'wypłat', 'wpłat', 'pieni[ąę]d', 'pieniężn', 'gotówk', 'walut', 'depozyt', 'kredyt', 'hazard', 'fundusz', 'koszt'],
    tr: ['*bahis', 'bahse', '*satın', 'satış', 'öde(?:me|nir|r|n|di|yin|mek|nen)', 'ödeme', 'para(?:\\b|sı|yı|da|dan|lar|nın|nızı)', '*nakit', 'döviz', 'para birimi', 'yatır(?:ma|ın|ma)', 'kredi', 'kumar', 'fon(?:lar|u|un)?(?![\\p{L}])', 'maliyet'],
    id: ['taruh', 'bertaruh', 'beli', 'pembelian', 'membeli', 'bayar', 'membayar', 'pembayaran', 'dibayar', 'uang', 'tunai', 'mata uang', 'setor', 'setoran', 'penarikan', 'tarik dana', 'kredit', 'judi', 'perjudian', 'dana(?![\\p{L}])', 'biaya'],
    vi: ['cược', 'đặt cược', 'mua(?![\\p{L}])', 'mua ', 'thanh toán', 'trả(?![\\p{L}])', 'tiền', 'tiền mặt', 'tiền tệ', 'nạp tiền', 'rút tiền', 'tín dụng', 'cờ bạc', 'quỹ', 'chi phí'],
    fi: ['veto', 'vedon', 'vedot', 'panos', 'panok', 'osta', 'osto', 'maksa', 'maksu', 'maksett', '*raha', '*käteis', 'valuutta', 'talletus', 'nosto', 'nostaa', 'luotto', 'hyvit', 'uhkapel', 'rahasto', 'kustannus', '*kustan'],
    ru: ['ставк', 'ставл', 'пари(?![\\p{L}])', 'куп(?:и|л|ит|ить|ите)', 'покупк', 'оплат', 'плат(?:ит|ить|ёж|еж|ят|ите|ишь)', 'выплат', 'деньг', 'денеж', 'наличн', 'валют', 'депозит', 'вывод ', 'кредит', 'азарт', 'фонд', 'стоимост'],
    ar: ['*رهان', '*راهن', '*مراهن', '*اشتر', '*شراء', '*نقد', '*نقود', '*أموال', '*اموال', '*المال', '*عملة', '*العملة', '*إيداع', '*ايداع', '*سحب', '*دفع', '*مدفوع', '*قمار', '*مقامر', '*ائتمان', '*تمويل', '*تكلفة', '*بالمال'],
    hi: ['दा[ँं]व', 'सट्टा', 'बेट', 'ख़?रीद', 'भुगतान', 'पैसे', 'पैसा', 'नकद', 'मुद्रा', 'जमा राशि', 'जमा कर', 'डिपॉ[ज़ज]िट', 'निकासी', 'क्रेडिट', 'जुआ', 'निधि', 'लागत', 'कैश'],
    ja: ['*ベット', '*賭', '*購入', '*買', '*現金', '*お金', '*金銭', '*通貨', '*入金', '*出金', '*支払', '*払い', '*払戻', '*配当', '*ペイアウト', '*掛け金', '*資金', '*クレジット', '*ギャンブル', '*賭博', '*コスト', '*キャッシュ'],
    ko: ['*베팅', '*배팅', '*내기', '*구매', '*구입', '*현금', '*돈', '*머니', '*통화', '*입금', '*출금', '*지불', '*결제', '*배당', '*크레딧', '*도박', '*판돈', '*자금', '*비용', '*캐시'],
    zh: ['*投注', '*下注', '*押注', '*赌', '*购买', '*买', '*现金', '*金钱', '*钱', '*货币', '*存款', '*取款', '*提款', '*支付', '*付款', '*赔付', '*派彩', '*信用', '*资金', '*博彩', '*成本', '*费用', '*彩金']
  };
  // « pay » : la forme française « paye »… est incluse ; en ja/ko/zh/ar les fragments sont des sous-chaînes (pas d'espace entre les mots)
  exp.WORDS = W;
  // compile : { lang: [ {w, re} ] }
  exp.compile = function () {
    var out = {};
    Object.keys(W).forEach(function (l) {
      out[l] = W[l].map(function (w) {
        var any = w.charAt(0) === '*', src = (any ? w.slice(1) : w).normalize('NFC');
        return { w: w, re: new RegExp((any ? '' : '(?<![\\p{L}\\p{N}\\p{M}])') + '(?:' + src + ')', 'iu') };
      });
    });
    return out;
  };
})(typeof module !== 'undefined' ? module.exports : this);
