let data = JSON.parse(localStorage.getItem('basic_notes_v6')) || {
    playlists: [{id: 1, title: 'Моё'}],
    notes: [],
    currentPlaylistId: 1,
    sortAsc: false,
    lang: 'ru',
    theme: 'dark'
};

let tempAttachments = []; 

const translations = {
    ru: {
        logo: "Basic Notes", welcome: "ПУСТО", placeholder: "ТЕКСТ...", searchPlaceholder: "Поиск...",
        menu: "МЕНЮ", settings: "НАСТРОЙКИ", team: "КОМАНДА", close: "ЗАКРЫТЬ",
        addPlaylist: "+ Плейлист", playlistLabel: "ПЛЕЙЛИСТЫ", pinnedBadge: "ЗАКРЕП",
        sort: "Время", exportAll: "Экспорт Всех", import: "Импорт",
        cancel: "ОТМЕНА", back: "НАЗАД", done: "ГОТОВО",
        tDark: "ТЕМНАЯ", tLight: "СВЕТЛАЯ", tAcc: "КОНТРАСТНАЯ",
        confirmNoteDel: "Удалить?", confirmPListDel: "Удалить плейлист?",
        newPListTitle: "Название", newPListPlace: "...",
        create: "Создать", counter: "Заметки",
        m1: "Александров Арсений", m2: "Малышев Егор"
    },
    en: {
        logo: "Basic Notes", welcome: "EMPTY", placeholder: "TYPE...", searchPlaceholder: "Search...",
        menu: "MENU", settings: "SETTINGS", team: "TEAM", close: "CLOSE",
        addPlaylist: "+ Playlist", playlistLabel: "PLAYLISTS", pinnedBadge: "PINNED",
        sort: "Time", exportAll: "Export All", import: "Import",
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
    document.getElementById('searchInput').placeholder = t.searchPlaceholder;
    document.getElementById('ui-menu-title').innerText = t.menu;
    document.getElementById('ui-settings-title').innerText = t.settings;
    document.getElementById('ui-btn-settings-menu').innerText = t.settings;
    document.getElementById('ui-btn-team').innerText = t.team;
    document.getElementById('ui-add-playlist').innerText = t.addPlaylist;
    document.getElementById('ui-playlist-label').innerText = t.playlistLabel;
    document.getElementById('ui-btn-sort').innerText = t.sort;
    document.getElementById('ui-btn-export').innerText = t.exportAll;
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
    const searchText = document.getElementById('searchInput').value.toLowerCase();

    let filtered = data.notes.filter(n => n.pid === data.currentPlaylistId);
    if (searchText) {
        filtered = filtered.filter(n => n.text.toLowerCase().includes(searchText));
    }
    
    if (!data.sortAsc) {
        filtered.sort((a, b) => (a.pinned === b.pinned) ? 0 : a.pinned ? -1 : 1);
    }

    document.getElementById('playlistTabs').innerHTML = data.playlists.map(p => `
        <button onclick="data.currentPlaylistId=${p.id}; save();" class="playlist-tab uppercase text-sm ${data.currentPlaylistId === p.id ? 'active' : ''}">${p.title}</button>
    `).join('');

    document.getElementById('ui-counter').innerText = filtered.length;

    const list = document.getElementById('notesList');
    if(!filtered.length) {
        list.innerHTML = `<div class="col-span-full h-40 flex items-center justify-center opacity-40 font-black uppercase text-4xl raleway">${t.welcome}</div>`;
    } else {
        list.innerHTML = filtered.map((n, i) => {
            // Собираем все вложения в один массив для логики превью
            let allMedia = [];
            if (n.image) allMedia.push({ type: 'image/jpeg', data: n.image });
            if (n.attachments) allMedia.push(...n.attachments);

            let mediaHtml = '';
            if (allMedia.length > 0) {
                const first = allMedia[0];
                let content = '';
                if (first.type.startsWith('image/')) content = `<img src="${first.data}" class="note-image">`;
                else if (first.type.startsWith('video/')) content = `<video src="${first.data}" class="note-video"></video>`;
                else content = `<div class="file-attachment">📄 ${first.name || 'File'}</div>`;

                const counter = allMedia.length > 1 ? `<div class="media-counter">+${allMedia.length - 1}</div>` : '';
                mediaHtml = `<div class="media-preview-wrapper">${content}${counter}</div>`;
            }

            return `
            <div class="p-4 rounded-[30px] mint-border bg-[var(--card-bg)] relative break-inside-avoid shadow-sm">
                <div class="absolute top-4 right-4 flex gap-2">
                     <button onclick="exportSingleNote(${n.id})" class="action-btn text-[10px] border-2 border-current px-1.5 rounded">💾</button>
                     <button onclick="editNote(${n.id})" class="action-btn text-[10px] border-2 border-current px-1.5 rounded">✏️</button>
                </div>
                ${n.pinned ? `<span class="pinned-badge">${t.pinnedBadge}</span>` : ''}
                <div onclick="openNote(${n.id})" class="cursor-pointer">
                    <div class="w-10 h-1.5 bg-[#ffff00] mb-3 rounded-full border border-black/20"></div>
                    <p class="font-black truncate-text">${n.text}</p>
                    ${mediaHtml}
                </div>
                <div class="flex justify-between items-center mt-3 pt-3 border-t border-white/10 font-black">
                    <div class="flex gap-2 items-center">
                        <button onclick="togglePin(${n.id})" class="text-lg action-btn">${n.pinned ? '📍' : '📌'}</button>
                        <button onclick="moveNote(${i}, -1)" class="action-btn text-[10px] border-2 border-current px-1.5 rounded">↑</button>
                        <button onclick="moveNote(${i}, 1)" class="action-btn text-[10px] border-2 border-current px-1.5 rounded">↓</button>
                    </div>
                    <button onclick="showDialog('delNote', ${n.id})" class="text-xl action-btn">✕</button>
                </div>
            </div>
            `;
        }).join('');
    }

    document.getElementById('menuPlaylists').innerHTML = data.playlists.map(p => `
        <div class="flex justify-between items-center p-4 rounded-2xl ${data.currentPlaylistId === p.id ? 'bg-black/20' : ''} border-2 border-black/10">
            <span onclick="data.currentPlaylistId=${p.id}; toggleMenu(); save();" class="flex-1 truncate">${p.title}</span>
            <button onclick="event.stopPropagation(); showDialog('delPlaylist', ${p.id})" class="ml-4 font-black text-2xl">✕</button>
        </div>
    `).join('');
}

// Загрузка файлов
document.getElementById('attachFiles').addEventListener('change', async function(e) {
    const files = e.target.files;
    for (let file of files) {
        if (file.size > 2 * 1024 * 1024) { alert(`File ${file.name} is too big! Max 2MB.`); continue; }
        const reader = new FileReader();
        reader.onload = (event) => {
            tempAttachments.push({ name: file.name, type: file.type, data: event.target.result });
            renderAttachmentsPreview();
        };
        reader.readAsDataURL(file);
    }
    this.value = '';
});

function renderAttachmentsPreview() {
    const container = document.getElementById('attachmentsPreview');
    if(tempAttachments.length === 0) { container.classList.add('hidden'); return; }
    container.classList.remove('hidden');
    container.innerHTML = tempAttachments.map((a, index) => `
        <div class="relative inline-block shrink-0">
            <div class="h-16 w-16 bg-white/10 rounded-xl flex items-center justify-center text-[10px] border-2 border-[#ffff00] overflow-hidden">
                ${a.type.startsWith('image/') ? `<img src="${a.data}" class="object-cover h-full w-full">` : (a.type.startsWith('video/') ? '🎬' : '📄')}
            </div>
            <button onclick="removeAttachment(${index})" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-[10px] font-bold">✕</button>
        </div>
    `).join('');
}

function removeAttachment(index) { tempAttachments.splice(index, 1); renderAttachmentsPreview(); }

function addNote() {
    const el = document.getElementById('ui-textarea');
    if(!el.value.trim() && tempAttachments.length === 0) return;
    data.notes.push({ 
        id: Date.now(), 
        pid: data.currentPlaylistId, 
        text: el.value, 
        attachments: [...tempAttachments],
        pinned: false
    });
    el.value = ''; tempAttachments = []; renderAttachmentsPreview(); save();
}

function editNote(id) {
    const n = data.notes.find(x => x.id === id);
    if(n) {
        const el = document.getElementById('ui-textarea');
        el.value = n.text;
        tempAttachments = n.attachments ? [...n.attachments] : [];
        renderAttachmentsPreview();
        data.notes = data.notes.filter(x => x.id !== id);
        el.focus();
        save();
    }
}

function moveNote(index, direction) {
    const filtered = data.notes.filter(n => n.pid === data.currentPlaylistId);
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= filtered.length) return;
    const realIdx1 = data.notes.indexOf(filtered[index]);
    const realIdx2 = data.notes.indexOf(filtered[targetIndex]);
    [data.notes[realIdx1], data.notes[realIdx2]] = [data.notes[realIdx2], data.notes[realIdx1]];
    save();
}

function togglePin(id) {
    const n = data.notes.find(x => x.id === id);
    if(n) n.pinned = !n.pinned;
    save();
}

document.getElementById('importBackup').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const imported = JSON.parse(event.target.result);
            if (imported.notes) { data.notes = [...data.notes, ...imported.notes]; save(); }
        } catch (err) { alert("Error!"); }
    };
    reader.readAsText(file);
    this.value = '';
});

function toggleMenu() { document.getElementById('menu').classList.toggle('drawer-open'); document.getElementById('overlay').classList.toggle('hidden'); }
function toggleSettings() { document.getElementById('settingsScreen').classList.toggle('active'); }
function toggleContact() { document.getElementById('contactScreen').classList.toggle('active'); }

function openNote(id) { 
    const n = data.notes.find(x => x.id === id);
    let html = `<p class="text-2xl md:text-3xl font-black leading-tight whitespace-pre-wrap text-[var(--text)] mb-6">${n.text}</p>`;
    let allMedia = [];
    if (n.image) allMedia.push({ type: 'image/jpeg', data: n.image });
    if (n.attachments) allMedia.push(...n.attachments);
    
    allMedia.forEach(a => {
        if(a.type.startsWith('image/')) html += `<img src="${a.data}" class="full-note-image">`;
        else if(a.type.startsWith('video/')) html += `<video src="${a.data}" controls class="full-note-video"></video>`;
        else html += `<a href="${a.data}" download="${a.name}" class="block bg-white/10 p-4 border-2 border-[var(--card-border)] rounded-2xl mb-4 font-bold text-center">Download: ${a.name}</a>`;
    });
    
    document.getElementById('fullNoteContent').innerHTML = html;
    document.getElementById('viewNoteModal').classList.add('active'); 
}

function closeNoteView() { document.getElementById('viewNoteModal').classList.remove('active'); }
function closeDialog() { document.getElementById('customDialog').classList.remove('active'); }
function sortNotes() { data.sortAsc = !data.sortAsc; save(); }

function exportAllNotes() {
    const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'full_backup.json'; a.click();
}

function exportSingleNote(id) {
    const n = data.notes.find(x => x.id === id);
    if(n) {
        const blob = new Blob([JSON.stringify({notes: [n]})], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `note_${id}.json`; a.click();
    }
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
