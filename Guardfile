# sass to css
guard 'sass', :input => 'assets/sass', :output => 'public/css', :line_numbers => true, :all_on_start => true

# This will concatenate the javascript files specified in :files to js/main.js
guard :concat, type: "js", files: %w(vendor/bootstrap/bootstrap-tooltip vendor/bootstrap/bootstrap-modal vendor/bootstrap/bootstrap-transition vendor/bootstrap/bootstrap-button vendor/bootstrap/bootstrap-popover vendor/bootstrap/bootstrap-alert vendor/jquery-ui-1.10.0.custom.min vendor/jquery.ui.slider.labels vendor/jquery.placeholder vendor/jquery.debounce plugins map page), input_dir: "assets/scripts", output: "public/js/main"

# live reload
guard 'livereload' do
  watch(%r{public/js/.+\.(js)$})
  watch(%r{public/css/.+\.(css)})
  watch(%r{public/.+\.(html)$})
end
