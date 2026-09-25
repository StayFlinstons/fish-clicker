// Notas de atualização (abre uma vez por versão).
// Métodos do FishingGame: aplicados via applyMixins() em game.js (o `this` é o jogo).
import { sound } from '../sound.js';

export class PatchNotesMethods {
  checkPatchNotesOnStartup() {
    try {
      const storageKey = 'fc_last_seen_patch_version';
      const lastSeen = localStorage.getItem(storageKey);
      if (lastSeen !== this.gameVersion) {
        // Registra a nova versão para que só exiba uma única vez após o update
        localStorage.setItem(storageKey, this.gameVersion);
        setTimeout(() => {
          this.openPatchNotesModal(true); // true = ativa o timer obrigatório de 5s para fechar
        }, 600);
      }
    } catch (e) {
      console.warn('Erro ao verificar notas de atualização:', e);
    }
  }

  openPatchNotesModal(withCooldown = false) {
    sound.playClick?.();
    const modal = document.getElementById('patch-notes-modal');
    if (!modal) return;
    modal.classList.remove('hidden');

    const btnClose = document.getElementById('btn-close-patch-notes');
    const btnCloseX = document.getElementById('btn-close-patch-notes-x');

    if (this.patchNotesTimerInterval) {
      clearInterval(this.patchNotesTimerInterval);
      this.patchNotesTimerInterval = null;
    }

    if (withCooldown) {
      this.patchNotesCooldownActive = true;
      let secondsLeft = 5;

      if (btnCloseX) {
        btnCloseX.style.display = 'none';
      }

      if (btnClose) {
        btnClose.disabled = true;
        btnClose.textContent = `ENTENDIDO (${secondsLeft}s)`;
        btnClose.style.opacity = '0.5';
        btnClose.style.cursor = 'not-allowed';
        btnClose.style.pointerEvents = 'none';
        btnClose.classList.remove('animate-pulse');
      }

      this.patchNotesTimerInterval = setInterval(() => {
        secondsLeft--;
        if (secondsLeft > 0) {
          if (btnClose) btnClose.textContent = `ENTENDIDO (${secondsLeft}s)`;
        } else {
          clearInterval(this.patchNotesTimerInterval);
          this.patchNotesTimerInterval = null;
          this.patchNotesCooldownActive = false;

          if (btnClose) {
            btnClose.disabled = false;
            btnClose.textContent = 'ENTENDIDO';
            btnClose.style.opacity = '1';
            btnClose.style.cursor = 'pointer';
            btnClose.style.pointerEvents = 'auto';
            btnClose.classList.add('animate-pulse');
          }
          if (btnCloseX) {
            btnCloseX.style.display = '';
          }
          sound.playCatch?.();
        }
      }, 1000);
    } else {
      this.patchNotesCooldownActive = false;
      if (btnClose) {
        btnClose.disabled = false;
        btnClose.textContent = 'ENTENDIDO';
        btnClose.style.opacity = '1';
        btnClose.style.cursor = 'pointer';
        btnClose.style.pointerEvents = 'auto';
        btnClose.classList.remove('animate-pulse');
      }
      if (btnCloseX) {
        btnCloseX.style.display = '';
      }
    }
  }

  closePatchNotesModal() {
    if (this.patchNotesCooldownActive) return;
    if (this.patchNotesTimerInterval) {
      clearInterval(this.patchNotesTimerInterval);
      this.patchNotesTimerInterval = null;
    }
    sound.playClick?.();
    const modal = document.getElementById('patch-notes-modal');
    modal?.classList.add('hidden');
  }
}
