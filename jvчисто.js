let data = JSON.parse(localStorage.getItem('basic_notes_v6')) || {
    playlists: [{id: 1, title: 'Моё'}],
    notes: [],
    currentPlaylistId: 1,
    sortAsc: false,
    lang: 'ru',
    theme: 'dark'
};

let tempImageData = null;

const translations = {
    ru: {
        logo: "Basic Notes", welcome: "ПУСТО", placeholder: "ТЕКСТ...",
        menu: "МЕНЮ", settings: "НАСТРОЙКИ", team: "КОМАНДА", close: "ЗАКРЫТЬ",
        addPlaylist: "+ Плейлист", playlistLabel: "ПЛЕЙЛИСТЫ",
        sort: "Время", export: "Экспорт", import: "Импорт",
        cancel: "ОТМЕНА", back: "НАЗАД", done: "ГОТОВО",
        tDark: "ТЕМНАЯ", tLight: "СВЕТЛАЯ", tAcc: "КОНТРАСТНАЯ",
        confirmNoteDel: "Удалить?", confirmPListDel: "Удалить плейлист?",
        newPListTitle: "Название", newPListPlace: "...",
        create: "Создать", counter: "Заметки",
        m1: "Александров Арсений", m2: "Малышев Егор"
    },
    en: {
        logo: "Basic Notes", welcome: "EMPTY", placeholder: "TYPE...",
        menu: "MENU", settings: "SETTINGS", team: "TEAM", close: "CLOSE",
        addPlaylist: "+ Playlist", playlistLabel: "PLAYLISTS",
        sort: "Time", export: "Export", import: "Import",
        cancel: "CANCEL", back: "BACK", done: "DONE",
        tDark: "DARK", tLight: "LIGHT", tAcc: "HIGH CONTRAST",
        confirmNoteDel: "Delete?", confirmPListDel: "Delete playlist?",
        newPListTitle: "Title", newPListPlace: "...",
        create: "Create", counter: "Notes",
        m1: "Arseniy Alexandrov", m2: "Egor Malyshev"
    }
};

function save() { localStorage.setItem('basic_notes_v6', JSON.stringify(data)); render(); }

function setLanguage(lang) {
    data.lang = lang;
    const t = translations[lang];
    document.getElementById('ui-logo').innerText = t.logo;
    document.getElementById('ui-textarea').placeholder = t.placeholder;
    document.getElementById('ui-menu-title').innerText = t.menu;
    document.getElementById('ui-settings-title').innerText = t.settings;
    document.getElementById('ui-btn-settings-menu').innerText = t.settings;
    document.getElementById('ui-btn-team').innerText = t.team;
    document.getElementById('ui-add-playlist').innerText = t.addPlaylist;
    document.getElementById('ui-playlist-label').innerText = t.playlistLabel;
    document.getElementById('ui-btn-sort').innerText = t.sort;
    document.getElementById('ui-btn-export').innerText = t.export;
    document.getElementById('ui-btn-import').innerText = t.import;
    document.getElementById('ui-btn-close-view').innerText = t.back;
    document.getElementById('ui-settings-done').innerText = t.done;
    document.getElementById('ui-theme-dark').innerText = t.tDark;
    document.getElementById('ui-theme-light').innerText = t.tLight;
    document.getElementById('ui-theme-acc').innerText = t.tAcc;
    document.getElementById('ui-team-title').innerText = t.team;
    document.getElementById('ui-team-close').innerText = t.close;
    document.getElementById('ui-limit-label').innerText = t.counter;
    document.getElementById('member-1').innerText = t.m1;
    document.getElementById('member-2').innerText = t.m2;
    document.getElementById('ui-dialog-cancel').innerText = t.cancel;
    save();
}

function setTheme(theme) { data.theme = theme; save(); }

function render() {
    document.body.className = 'theme-' + data.theme;
    const t = translations[data.lang];
    const filtered = data.notes.filter(n => n.pid === data.currentPlaylistId);
    
    if (!data.sortAsc) {
        filtered.sort((a, b) => (a.pinned === b.pinned) ? 0 : a.pinned ? -1 : 1);
    }

    document.getElementById('playlistTabs').innerHTML = data.playlists.map(p => `
        <button onclick="data.currentPlaylistId=${p.id}; save();" class="playlist-tab uppercase text-sm ${data.currentPlaylistId === p.id ? 'active' : ''}">${p.title}</button>
    `).join('');

    document.getElementById('ui-counter').innerText = filtered.length;

    const list = document.getElementById('notesList');
    if(!filtered.length) {
        list.innerHTML = `<div class="h-full flex items-center justify-center opacity-40 font-black uppercase text-4xl raleway">${t.welcome}</div>`;
    } else {
        list.innerHTML = filtered.map((n, i) => `
            <div class="p-6 rounded-[40px] mint-border bg-[var(--card-bg)] relative">
                <div class="absolute top-6 right-6 flex gap-3">
                     <button onclick="editNote(${n.id})" class="action-btn text-lg">✏️</button>
                </div>
                ${n.pinned ? '<span class="pinned-badge">PINNED</span>' : ''}
                <div onclick="openNote(${n.id})">
                    <div class="w-14 h-2 bg-[#ffff00] mb-4 rounded-full border border-black/20"></div>
                    <p class="text-xl font-black leading-tight truncate-text">${n.text}</p>
                    ${n.image ? `<img src="${n.image}" class="note-image">` : ''}
                </div>
                <div class="flex justify-between items-center mt-4 pt-4 border-t border-white/10 font-black">
                    <div class="flex gap-4 items-center">
                        <button onclick="togglePin(${n.id})" class="text-xl action-btn">${n.pinned ? '📍' : '📌'}</button>
                        <button onclick="moveNote(${i}, -1)" class="action-btn text-xs border-2 border-current px-2 rounded">↑</button>
                        <button onclick="moveNote(${i}, 1)" class="action-btn text-xs border-2 border-current px-2 rounded">↓</button>
                    </div>
                    <button onclick="showDialog('delNote', ${n.id})" class="text-2xl action-btn">✕</button>
                </div>
            </div>
        `).join('');
    }

    document.getElementById('menuPlaylists').innerHTML = data.playlists.map(p => `
        <div class="flex justify-between items-center p-4 rounded-2xl ${data.currentPlaylistId === p.id ? 'bg-black/20' : ''} border-2 border-black/10">
            <span onclick="data.currentPlaylistId=${p.id}; toggleMenu(); save();" class="flex-1 truncate">${p.title}</span>
            <button onclick="event.stopPropagation(); showDialog('delPlaylist', ${p.id})" class="ml-4 font-black text-2xl">✕</button>
        </div>
    `).join('');
}

function addNote() {
    const el = document.getElementById('ui-textarea');
    if(!el.value.trim() && !tempImageData) return;
    data.notes.push({ 
        id: Date.now(), 
        pid: data.currentPlaylistId, 
        text: el.value, 
        image: tempImageData,
        pinned: false,
        date: new Date() 
    });
    el.value = ''; 
    clearTempImage();
    save();
    document.getElementById('notesList').scrollTo({top: 99999, behavior: 'smooth'});
}

function editNote(id) {
    const n = data.notes.find(x => x.id === id);
    if(n) {
        const el = document.getElementById('ui-textarea');
        el.value = n.text;
        if(n.image) {
            tempImageData = n.image;
            document.getElementById('tempImage').src = tempImageData;
            document.getElementById('imagePreviewContainer').classList.remove('hidden');
        }
        data.notes = data.notes.filter(x => x.id !== id);
        el.focus();
        save();
    }
}

function moveNote(index, direction) {
    const filtered = data.notes.filter(n => n.pid === data.currentPlaylistId);
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= filtered.length) return;
    
    const noteToMove = filtered[index];
    const otherNote = filtered[targetIndex];
    
    const realIdx1 = data.notes.indexOf(noteToMove);
    const realIdx2 = data.notes.indexOf(otherNote);
    
    [data.notes[realIdx1], data.notes[realIdx2]] = [data.notes[realIdx2], data.notes[realIdx1]];
    save();
}

function togglePin(id) {
    const n = data.notes.find(x => x.id === id);
    if(n) n.pinned = !n.pinned;
    save();
}

document.getElementById('importFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    if (file.type.startsWith('image/')) {
        reader.onload = (event) => {
            tempImageData = event.target.result;
            document.getElementById('tempImage').src = tempImageData;
            document.getElementById('imagePreviewContainer').classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    } else {
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (imported.notes) {
                    data.notes = [...data.notes, ...imported.notes];
                    save();
                }
            } catch (err) { alert("Error!"); }
        };
        reader.readAsText(file);
    }
});

function clearTempImage() {
    tempImageData = null;
    document.getElementById('imagePreviewContainer').classList.add('hidden');
}

function toggleMenu() { document.getElementById('menu').classList.toggle('drawer-open'); document.getElementById('overlay').classList.toggle('hidden'); }
function toggleSettings() { document.getElementById('settingsScreen').classList.toggle('active'); }
function toggleContact() { document.getElementById('contactScreen').classList.toggle('active'); }
function openNote(id) { 
    const n = data.notes.find(x => x.id === id);
    document.getElementById('fullNoteText').innerText = n.text;
    const img = document.getElementById('fullNoteImage');
    if(n.image) { img.src = n.image; img.classList.remove('hidden'); }
    else { img.classList.add('hidden'); }
    document.getElementById('viewNoteModal').classList.add('active'); 
}
function closeNoteView() { document.getElementById('viewNoteModal').classList.remove('active'); }
function closeDialog() { document.getElementById('customDialog').classList.remove('active'); }
function triggerImport() { document.getElementById('importFile').click(); }
function sortNotes() { data.sortAsc = !data.sortAsc; save(); }
function exportNotes() {
    const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'notes_backup.json'; a.click();
}

function showDialog(type, id = null) {
    const t = translations[data.lang];
    const m = document.getElementById('customDialog');
    const i = document.getElementById('dialogInput');
    const d = document.getElementById('dialogDesc');
    const b = document.getElementById('dialogConfirmBtn');
    m.classList.add('active'); i.classList.add('hidden'); d.classList.remove('hidden');
    document.getElementById('dialogTitle').innerText = (type === 'playlist' ? t.newPListTitle : (type === 'delNote' ? t.confirmNoteDel : t.confirmPListDel));
    if(type === 'playlist') { i.classList.remove('hidden'); d.classList.add('hidden'); b.onclick = () => { if(i.value.trim()){ const nid = Date.now(); data.playlists.push({id:nid, title:i.value}); data.currentPlaylistId=nid; closeDialog(); save(); } }; }
    else { b.onclick = () => { if(type === 'delNote') data.notes = data.notes.filter(n => n.id !== id); else { data.playlists = data.playlists.filter(p => p.id !== id); data.notes = data.notes.filter(n => n.pid !== id); if(data.currentPlaylistId === id) data.currentPlaylistId = data.playlists[0]?.id || 0; } closeDialog(); save(); }; }
}

setLanguage(data.lang);
render();