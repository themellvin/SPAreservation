import re
import sys

def patch_app_tsx():
    with open('src/App.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. handleQuickBook
    old_logic1 = """      if (matchedSpec && bookTreatment) {
        const exactEt = calEventTypes.find(et => 
          et.title.toLowerCase() === bookTreatment.toLowerCase() && 
          (String(et.userId) === String(matchedSpec.calUserId))
        );
        if (exactEt) {
          eventTypeId = exactEt.id;
          eventSlug = exactEt.slug;
        }
      }

      // STRICT VALIDATION: Ensure eventTypeId / eventSlug actually belongs to the user (prevents corrupted localStorage errors)
      if (matchedSpec) {
        let isValid = false;
        if (eventTypeId) {
          isValid = calEventTypes.some(et => et.id === eventTypeId && String(et.userId) === String(matchedSpec.calUserId));
        } else if (eventSlug) {
          isValid = calEventTypes.some(et => et.slug === eventSlug && String(et.userId) === String(matchedSpec.calUserId));
        }
        
        if (!isValid) {
          // If the slug is corrupted (e.g. assigned to another user), find ANY valid event type for this user
          const safeEt = calEventTypes.find(et => String(et.userId) === String(matchedSpec.calUserId));
          if (safeEt) {
            eventTypeId = safeEt.id;
            eventSlug = safeEt.slug;
          } else {
            eventTypeId = undefined;
            eventSlug = ''; // Will likely fail API, but better than stealing another user's slug
          }
        }
      }"""
      
    new_logic1 = """      if (matchedSpec && bookTreatment) {
        const lookupKey = matchedSpec.calUserId || matchedSpec.calUsername;
        const specEts = lookupKey ? (specialistEventTypes[lookupKey.toString()] || []) : [];
        const exactEt = specEts.find(et => 
          et.title.toLowerCase() === bookTreatment.toLowerCase()
        );
        if (exactEt) {
          eventTypeId = exactEt.id;
          eventSlug = exactEt.slug;
        }
      }

      // STRICT VALIDATION: Ensure eventTypeId / eventSlug actually belongs to the user
      if (matchedSpec) {
        let isValid = false;
        const lookupKey = matchedSpec.calUserId || matchedSpec.calUsername;
        const specEts = lookupKey ? (specialistEventTypes[lookupKey.toString()] || []) : [];
        
        if (eventTypeId) {
          isValid = specEts.some(et => et.id === eventTypeId);
        } else if (eventSlug) {
          isValid = specEts.some(et => et.slug === eventSlug);
        }
        
        if (!isValid) {
          const safeEt = specEts[0];
          if (safeEt) {
            eventTypeId = safeEt.id;
            eventSlug = safeEt.slug;
          } else {
            eventTypeId = undefined;
            eventSlug = '';
          }
        }
      }"""
      
    # 2. Reschedule logic fallback (multiple instances, e.g. handleUpdateAppointment, drag/drop, etc)
    # The pattern is:
    # const exactEt = calEventTypes.find(et => 
    #   et.title.toLowerCase() === (selectedAppointment.procedure).toLowerCase() && 
    #   (String(et.userId) === String(matchedSpec?.calUserId))
    # );
    
    # We can replace this with regex.
    pattern = r"""\s+const exactEt = calEventTypes\.find\(et =>\s+et\.title\.toLowerCase\(\) === \(([^)]+)\)\.toLowerCase\(\) &&\s+\(String\(et\.userId\) === String\(matchedSpec\?\.calUserId\)\)\s+\);"""
    
    def repl(m):
        proc = m.group(1)
        return f"""
              const lookupKey = matchedSpec?.calUserId || matchedSpec?.calUsername;
              const specEts = lookupKey ? (specialistEventTypes[lookupKey.toString()] || []) : [];
              const exactEt = specEts.find(et => et.title.toLowerCase() === ({proc}).toLowerCase());"""
    
    if old_logic1 in content:
        content = content.replace(old_logic1, new_logic1)
    else:
        print("Could not find handleQuickBook logic")
        sys.exit(1)
        
    content = re.sub(pattern, repl, content)
    
    with open('src/App.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched App.tsx successfully")

patch_app_tsx()
