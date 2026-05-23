/**
 * gastrowerke – contact.js
 * Kontaktformular: Validierung, Absende-Simulation, Bestätigung
 */

'use strict';

document.addEventListener('DOMContentLoaded',()=>{
  const form=document.getElementById('contactForm');
  if(!form)return;

  const fields={
    name:    {el:form.querySelector('#cName'),    msg:'Bitte geben Sie Ihren Namen ein.'},
    email:   {el:form.querySelector('#cEmail'),   msg:'Bitte geben Sie eine gültige E-Mail-Adresse ein.'},
    subject: {el:form.querySelector('#cSubject'), msg:'Bitte wählen Sie ein Betreff.'},
    message: {el:form.querySelector('#cMessage'), msg:'Bitte geben Sie eine Nachricht ein (mind. 20 Zeichen).'},
    privacy: {el:form.querySelector('#cPrivacy'), msg:'Bitte bestätigen Sie die Datenschutzerklärung.'},
  };

  function clearError(field){
    const wrap=field.el?.closest('.form-group');
    wrap?.classList.remove('has-error');
    const err=wrap?.querySelector('.form-error');
    if(err)err.textContent='';
  }
  function setError(field,msg){
    const wrap=field.el?.closest('.form-group');
    wrap?.classList.add('has-error');
    const err=wrap?.querySelector('.form-error');
    if(err)err.textContent=msg;
    return false;
  }
  function validateEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);}

  function validateAll(){
    let valid=true;
    Object.values(fields).forEach(f=>clearError(f));

    if(!fields.name.el?.value.trim())valid=setError(fields.name,fields.name.msg);
    if(!validateEmail(fields.email.el?.value.trim()||''))valid=setError(fields.email,fields.email.msg);
    if(!fields.subject.el?.value)valid=setError(fields.subject,fields.subject.msg);
    if((fields.message.el?.value.trim()||'').length<20)valid=setError(fields.message,fields.message.msg);
    if(!fields.privacy.el?.checked)valid=setError(fields.privacy,fields.privacy.msg);
    return valid;
  }

  // Live-Validierung
  Object.values(fields).forEach(f=>{
    f.el?.addEventListener('input',()=>clearError(f));
    f.el?.addEventListener('change',()=>clearError(f));
  });

  form.addEventListener('submit',async e=>{
    e.preventDefault();
    if(!validateAll())return;

    const btn=form.querySelector('#submitBtn');
    const successBox=document.getElementById('contactSuccess');
    const orig=btn.innerHTML;
    btn.innerHTML='⏳ Wird gesendet …';btn.disabled=true;

    // Simulation: 1.2 Sekunden Verzögerung (echtes Backend hier einhängen)
    await new Promise(r=>setTimeout(r,1200));

    btn.innerHTML=orig;btn.disabled=false;
    form.style.display='none';
    if(successBox){successBox.style.display='block';}
    window.scrollTo({top:0,behavior:'smooth'});

    // Formular-Daten lokal speichern (für Demo)
    const submissions=JSON.parse(localStorage.getItem('gw_contact_submissions')||'[]');
    submissions.push({
      name:fields.name.el.value.trim(),
      email:fields.email.el.value.trim(),
      subject:fields.subject.el.value,
      message:fields.message.el.value.trim(),
      date:new Date().toISOString()
    });
    localStorage.setItem('gw_contact_submissions',JSON.stringify(submissions));
  });
});
