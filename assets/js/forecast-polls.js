const options = ['Likely', 'Unsure', 'Unlikely'];
const temporaryVotes = new Map();

function voteKey(id, revision) {
  return `technology-horizons:vote:${id}:v${revision}`;
}

export function getForecastVote(id, revision) {
  const key = voteKey(id, revision);
  if (temporaryVotes.has(key)) return temporaryVotes.get(key);
  try {
    const vote = localStorage.getItem(key);
    return options.includes(vote) ? vote : null;
  } catch {
    return null;
  }
}

export function createForecastPoll(id, revision) {
  const key = voteKey(id, revision);
  let savedVote = getForecastVote(id, revision);
  const form = document.createElement('form');
  form.className = 'forecast-poll';

  const label = document.createElement('p');
  label.className = 'forecast-poll-label';
  label.textContent = 'Reader poll';
  const question = document.createElement('fieldset');
  const legend = document.createElement('legend');
  legend.textContent = 'How likely is this forecast?';
  const answers = document.createElement('div');
  answers.className = 'forecast-poll-options';
  for (const option of options) {
    const choice = document.createElement('label');
    choice.className = 'forecast-poll-option';
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'likelihood';
    radio.value = option;
    radio.checked = savedVote === option;
    const caption = document.createElement('span');
    caption.textContent = option;
    choice.append(radio, caption);
    answers.append(choice);
  }
  question.append(legend, answers);

  const actions = document.createElement('div');
  actions.className = 'forecast-poll-actions';
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'forecast-poll-submit';
  const clear = document.createElement('button');
  clear.type = 'button';
  clear.className = 'forecast-poll-clear';
  clear.textContent = 'Clear vote';
  actions.append(submit, clear);

  const feedback = document.createElement('p');
  feedback.className = 'forecast-poll-feedback';
  feedback.setAttribute('role', 'status');
  feedback.textContent = savedVote
    ? `Your vote is ${savedVote.toLowerCase()}.`
    : 'Votes are saved on this browser.';
  form.append(label, question, actions, feedback);

  function updateControls() {
    const selected = form.elements.likelihood.value;
    submit.textContent = savedVote ? 'Update vote' : 'Cast vote';
    submit.disabled = !selected || selected === savedVote;
    clear.hidden = !savedVote;
  }

  function saveVote(vote) {
    savedVote = vote;
    let persistent = true;
    try {
      if (vote) localStorage.setItem(key, vote);
      else localStorage.removeItem(key);
      temporaryVotes.delete(key);
    } catch {
      persistent = false;
      temporaryVotes.set(key, vote);
    }
    feedback.textContent = vote
      ? `Your vote is ${vote.toLowerCase()}. ${persistent ? 'Saved on this browser.' : 'Kept until you leave or reload this page.'}`
      : `Vote cleared${persistent ? '.' : ' for this visit.'}`;
    updateControls();
    form.dispatchEvent(new CustomEvent('forecast-vote-change', {
      bubbles: true,
      detail: { id, revision, vote }
    }));
  }

  form.addEventListener('change', updateControls);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const checked = question.querySelector('input:checked');
    if (!checked || checked.value === savedVote) return;
    if (document.activeElement === submit) checked.focus();
    saveVote(checked.value);
  });
  clear.addEventListener('click', () => {
    const checked = question.querySelector('input:checked');
    if (checked) checked.checked = false;
    question.querySelector('input').focus();
    saveVote(null);
  });
  updateControls();
  return form;
}
