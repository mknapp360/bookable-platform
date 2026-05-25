<?php
/**
 * Plugin Name: BookableCRM Contact Form
 * Description: Embed a BookableCRM enquiry form on any page using the [bookable_crm_form] shortcode.
 * Version: 1.0.0
 * Author: Bookable Ltd
 */

if (!defined('ABSPATH')) exit;

// ─── Settings page ──────────────────────────────────────────────────────────

add_action('admin_menu', function () {
    add_options_page(
        'BookableCRM Form',
        'BookableCRM Form',
        'manage_options',
        'bcrm-form',
        'bcrm_settings_page'
    );
});

add_action('admin_init', function () {
    register_setting('bcrm_settings', 'bcrm_supabase_url', [
        'sanitize_callback' => 'esc_url_raw',
    ]);
    register_setting('bcrm_settings', 'bcrm_embed_key', [
        'sanitize_callback' => 'sanitize_text_field',
    ]);
});

function bcrm_settings_page() {
    ?>
    <div class="wrap">
        <h1>BookableCRM Form Settings</h1>
        <form method="post" action="options.php">
            <?php
            settings_fields('bcrm_settings');
            ?>
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="bcrm_supabase_url">Supabase Project URL</label></th>
                    <td>
                        <input type="url" id="bcrm_supabase_url" name="bcrm_supabase_url"
                               value="<?php echo esc_attr(get_option('bcrm_supabase_url', '')); ?>"
                               class="regular-text" placeholder="https://xyz.supabase.co" />
                        <p class="description">Your Supabase project URL (found in BookableCRM settings).</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="bcrm_embed_key">Embed Key</label></th>
                    <td>
                        <input type="text" id="bcrm_embed_key" name="bcrm_embed_key"
                               value="<?php echo esc_attr(get_option('bcrm_embed_key', '')); ?>"
                               class="regular-text" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
                        <p class="description">Copy this from Settings &rarr; Widget in your BookableCRM dashboard.</p>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

// ─── Shortcode ──────────────────────────────────────────────────────────────

add_shortcode('bookable_crm_form', function () {
    $supabase_url = esc_attr(get_option('bcrm_supabase_url', ''));
    $embed_key    = esc_attr(get_option('bcrm_embed_key', ''));

    if (!$supabase_url || !$embed_key) {
        return '<p style="color:#888;">BookableCRM form is not configured yet.</p>';
    }

    // Inline CSS
    $css = <<<CSS
<style>
.bcrm-form{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;max-width:480px;margin:0 auto}
.bcrm-form h3{margin:0 0 1rem;font-size:1.25rem;font-weight:600;color:#1e293b}
.bcrm-form label{display:block;margin-bottom:.25rem;font-size:.875rem;font-weight:500;color:#475569}
.bcrm-form input,.bcrm-form textarea{display:block;width:100%;padding:.5rem .75rem;margin-bottom:1rem;border:1px solid #cbd5e1;border-radius:.5rem;font-size:.875rem;font-family:inherit;box-sizing:border-box}
.bcrm-form input:focus,.bcrm-form textarea:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59,130,246,.25)}
.bcrm-form textarea{resize:vertical;min-height:100px}
.bcrm-form button[type="submit"]{display:inline-block;padding:.625rem 1.5rem;background:#2563eb;color:#fff;border:none;border-radius:.5rem;font-size:.875rem;font-weight:500;cursor:pointer;transition:background .15s}
.bcrm-form button[type="submit"]:hover{background:#1d4ed8}
.bcrm-form button[type="submit"]:disabled{opacity:.5;cursor:not-allowed}
.bcrm-form .bcrm-success{padding:1rem;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:.5rem;color:#166534;font-size:.875rem}
.bcrm-form .bcrm-error{padding:.75rem;background:#fef2f2;border:1px solid #fecaca;border-radius:.5rem;color:#991b1b;font-size:.875rem;margin-bottom:1rem}
.bcrm-form .bcrm-loading{color:#94a3b8;font-size:.875rem}
</style>
CSS;

    // Container
    $html = '<div id="bcrm-form-root" class="bcrm-form"><p class="bcrm-loading">Loading form&hellip;</p></div>';

    // Inline JS
    $js = <<<JS
<script>
(function(){
  var root=document.getElementById('bcrm-form-root');
  var BASE='{$supabase_url}';
  var KEY='{$embed_key}';

  fetch(BASE+'/functions/v1/get-widget-config?embed_key='+encodeURIComponent(KEY))
    .then(function(r){if(!r.ok)throw new Error('Config error');return r.json()})
    .then(function(cfg){renderForm(cfg)})
    .catch(function(){root.innerHTML='<p style="color:#888;">Unable to load form.</p>'});

  function renderForm(cfg){
    var f=cfg.fields||{};
    var h='';
    if(cfg.title)h+='<h3>'+esc(cfg.title)+'</h3>';
    h+='<form id="bcrm-f">';
    h+='<div id="bcrm-err" style="display:none" class="bcrm-error"></div>';
    if(f.name!==false){h+='<label for="bcrm-name">Name</label><input id="bcrm-name" name="name" type="text" required>';}
    h+='<label for="bcrm-email">Email</label><input id="bcrm-email" name="email" type="email" required>';
    if(f.phone){h+='<label for="bcrm-phone">Phone</label><input id="bcrm-phone" name="phone" type="tel">';}
    if(f.message!==false){h+='<label for="bcrm-msg">Message</label><textarea id="bcrm-msg" name="message" required></textarea>';}
    h+='<button type="submit">'+esc(cfg.submit_label||'Send enquiry')+'</button>';
    h+='</form>';
    root.innerHTML=h;

    var form=document.getElementById('bcrm-f');
    var errEl=document.getElementById('bcrm-err');
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var btn=form.querySelector('button[type="submit"]');
      btn.disabled=true;
      btn.textContent='Sending\u2026';
      errEl.style.display='none';

      var body={embed_key:KEY,email:val('bcrm-email')};
      if(f.name!==false)body.name=val('bcrm-name');
      if(f.phone)body.phone=val('bcrm-phone');
      if(f.message!==false)body.message=val('bcrm-msg');

      fetch(BASE+'/functions/v1/submit-enquiry',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(body)
      })
      .then(function(r){return r.json().then(function(d){return{ok:r.ok,data:d}})})
      .then(function(res){
        if(res.ok){
          root.innerHTML='<div class="bcrm-success">'+esc(cfg.success_message||"Thanks! We'll be in touch shortly.")+'</div>';
        }else{
          errEl.textContent=res.data.error||'Something went wrong.';
          errEl.style.display='block';
          btn.disabled=false;
          btn.textContent=cfg.submit_label||'Send enquiry';
        }
      })
      .catch(function(){
        errEl.textContent='Network error. Please try again.';
        errEl.style.display='block';
        btn.disabled=false;
        btn.textContent=cfg.submit_label||'Send enquiry';
      });
    });
  }

  function val(id){var el=document.getElementById(id);return el?el.value:'';}
  function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}
})();
</script>
JS;

    return $css . $html . $js;
});
