# A sample Guardfile
# More info at https://github.com/guard/guard#readme

# sass to css
guard 'sass', :input => 'sass', :output => 'css'

# live reload
guard 'livereload' do
  watch(%r{.+\.(css|html|js)$})
end

# This will concatenate the javascript files specified in :files to js/main.js
guard :concat, type: "js", files: %w(vendor/bootstrap/bootstrap-tooltip vendor/bootstrap/bootstrap-modal vendor/bootstrap/bootstrap-transition vendor/bootstrap/bootstrap-button vendor/bootstrap/bootstrap-popover vendor/bootstrap/bootstrap-alert vendor/jquery-ui-1.10.0.custom.min vendor/jquery.ui.slider.labels vendor/jquery.placeholder vendor/jquery.debounce plugins map main), input_dir: "scripts", output: "js/main"

#guard :concat, type: "css", files: %w(), input_dir: "public/css", output: "public/css/all"



#guard 'uglify', :destination_file => "js/main.js" do
#  watch ('js/main.js')
#end
