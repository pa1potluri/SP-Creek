const KEY = 'sp-creek.reward-book.v1';
const fresh = () => ({ visited: [], ghostsMet: 0, viewpoint: false });
const read = () => { try { return { ...fresh(), ...(JSON.parse(localStorage.getItem(KEY)) || {}) }; } catch { return fresh(); } };
const save = (state) => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* optional storage */ } };
const stars = () => { try { return (JSON.parse(localStorage.getItem('sp-creek.hidden-stars.v1')) || []).length; } catch { return 0; } };

// A calm record of places a child has actually encountered, never a score or a task list.
export function buildRewardBook() {
  let state = read();
  const update = (change) => { state = { ...state, ...change }; save(state); return state; };
  return {
    visit(region) { if (!state.visited.includes(region)) update({ visited: [...state.visited, region] }); },
    meetGhost() { update({ ghostsMet: Math.max(1, state.ghostsMet) }); },
    collectFairRibbon(event) {if(event?.isTrusted)update({fairRibbon:true});},
    seeViewpoint() { if (!state.viewpoint) update({ viewpoint: true }); },
    restoreForTest(value) { state = { ...fresh(), ...value }; save(state); },
    get state() { return { ...state, stars: stars() }; },
  };
}
