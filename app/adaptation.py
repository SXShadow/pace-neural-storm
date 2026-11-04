from app.models import PracticeResult


PRIOR = 0.2
GUESS = 0.25
SLIP = 0.1
LEARN = 0.15
READY_THRESHOLD = 0.8


def update_knowledge(prior: float, correct: bool, attempts: int = 0) -> PracticeResult:
    if correct:
        numerator = prior * (1 - SLIP)
        denominator = numerator + (1 - prior) * GUESS
    else:
        numerator = prior * SLIP
        denominator = numerator + (1 - prior) * (1 - GUESS)
    posterior = numerator / denominator if denominator else prior
    probability = round(posterior + (1 - posterior) * LEARN, 4)
    if not correct:
        action = "scaffold"
        label = "Let's look at it another way"
        reason = "Your answer suggests this concept could use another example. The next activity uses smaller steps and a source passage."
    elif probability >= READY_THRESHOLD:
        action = "advance"
        label = "Ready for the next step"
        reason = "Your recent answers support moving forward. You can still revisit this concept whenever you like."
    else:
        action = "reinforce"
        label = "A good first step"
        reason = "You answered correctly. Another question can help check the idea from a different angle, or you can move on."
    return PracticeResult(
        probability=probability,
        action=action,
        label=label,
        reason=reason,
        attempts=attempts + 1,
    )
