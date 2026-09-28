/**
 * steam-emerge: adds a class to an element while it is in the viewport.
 *
 * Attributes:
 *   emerge="true"        turns it on
 *   emerge-offset="100"  pixels the element must be inside the viewport
 *   emerge-view="full"   "full" (default): fully visible, "enter": as soon as it enters
 *   emerge-keep="true"   keep the class after the element leaves the viewport
 *   emerge-class="name"  class to toggle, default "emerge"
 *
 * With steam-block, load this first. Both as classic defer scripts, not
 * type="module", so they run in document order:
 *   <script src="steam-emerge.js" defer></script>
 *   <script src="steam-block.js" defer></script>
 *
 * Standalone:
 *   document.querySelectorAll('[emerge="true"]').forEach(el => emerge(el));
 */

function emerge(element) {
    const debouncedCheckVisibility = debounce(checkVisibility.bind(element), 60);

    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }
    
    function checkVisibility() {
        const onStageAttribute = element.getAttribute('emerge');
        const offset = parseInt(element.getAttribute('emerge-offset')) || 0;
        const viewAttribute = element.getAttribute('emerge-view') || 'full';
        const keepStaged = element.getAttribute('emerge-keep') === 'true';
        const emergeClass = element.getAttribute('emerge-class') || 'emerge';

        if (onStageAttribute && onStageAttribute.toLowerCase() === 'true') {
            const isStaged = viewAttribute === 'enter' ? isOnStage(offset) || isOnStage(offset, true) : isOnStage(offset);
            const wasStaged = element.classList.contains(emergeClass);

            if (isStaged && !wasStaged) {
                element.classList.add(emergeClass);
            } else if (!isStaged && wasStaged) {
                const isPartiallyStaged = element.getBoundingClientRect().top < window.innerHeight && element.getBoundingClientRect().bottom >= 0;
                if (!isPartiallyStaged && !keepStaged) {
                    element.classList.remove(emergeClass);
                }
            }
        }
    }
    
    function isOnStage(offset, fullyOnStage = false, fromBottom = false) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    
        if (fullyOnStage) {
            return (
                rect.top >= 0 + offset &&
                rect.bottom <= windowHeight - offset
            );
        } else {
            if (fromBottom) {
                const bottomOffset = windowHeight - rect.bottom;
                return bottomOffset >= 0 && bottomOffset <= offset;
            } else {
                return rect.top + offset <= windowHeight && rect.bottom >= 0;
            }
        }
    }

    window.addEventListener('scroll', debouncedCheckVisibility);
    
    document.addEventListener('DOMContentLoaded', () => {
        checkVisibility();
    });
}

// Global, so steam-block.js can call it.
window.emerge = emerge;