"""Générateurs de nombres uniformes de [0, 1[ — identiques, bit à bit, à ceux de js/math.js.

- mulberry32(graine) : même suite que AnubisMath.mulberry32 (utile pour rejouer une graine JS).
- ScriptedRng(valeurs) : rejoue une liste de tirages imposés (entiers uint32 k -> k / 2^32, exacts) ; une fois la liste épuisée,
  continue avec mulberry32(graine de repli) — ou lève une erreur si strict=True. Sert aux tests de parité et aux books « forcés »
  (gain maximal).
- Le moteur n'appelle jamais autre chose que rng() : il est donc indifférent à la source.
"""
M32 = 0xFFFFFFFF
TWO32 = 4294967296.0


def _imul(a, b):
    return (a * b) & M32


def mulberry32(seed):
    a = seed & M32

    def rng():
        nonlocal a
        a = (a + 0x6D2B79F5) & M32
        t = _imul(a ^ (a >> 15), 1 | a)
        t = ((t + _imul(t ^ (t >> 7), 61 | t)) & M32) ^ t
        return ((t ^ (t >> 14)) & M32) / TWO32

    return rng


class ScriptedRng:
    """Tirages imposés. `script` : liste de flottants dans [0, 1[ ou, avec ints=True, d'entiers uint32."""

    def __init__(self, script, ints=False, fallback_seed=None, strict=False):
        self.values = [(k / TWO32 if ints else float(k)) for k in script]
        self.pos = 0
        self.strict = strict
        self._fallback = mulberry32(fallback_seed if fallback_seed is not None else 1)

    def __call__(self):
        if self.pos < len(self.values):
            v = self.values[self.pos]
        elif self.strict:
            raise IndexError("script de tirages épuisé après %d valeurs" % len(self.values))
        else:
            v = self._fallback()
        self.pos += 1
        return v

    @property
    def consumed(self):
        return self.pos

    @property
    def exhausted(self):
        return self.pos >= len(self.values)


class RecordingRng:
    """Enrobe une source et mémorise les tirages (utile pour rejouer / diagnostiquer)."""

    def __init__(self, rng):
        self.rng = rng
        self.draws = []

    def __call__(self):
        v = self.rng()
        self.draws.append(v)
        return v
