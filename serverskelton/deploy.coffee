require('shelljs/global')
svn_base="/Users/toukubo/svn/biz3/trunk"

## should change the last part of the directries
svn_build_dir=svn_base + "/vagrant/iot_platform/docker/overhall_front/cloud_os_code_front/"
source_code_zip_file=svn_build_dir + "cloud_os_code_front_end-master.zip"
build_target_dir="/Users/toukubo/Dropbox/git/cloud_os_code_front_end"

deploy_config_file_dir=svn_base+"/deploy/geranium.optim-test.com/geranium.optim-test.com/CodeOverhaulManager/CodeFront"
docker_build_url="http://jenkins.tokyo.optim.co.jp/job/docker-iot_platform-step3-front-overhall/"
cloud_os_core_apps_front_deploy_jenkins_url="http://jenkins.tokyo.optim.co.jp/job/deploy-geranium.optim-test.com/"

echo " # making into a deplyeable zip file into the svn_build_dir"
cd build_target_dir
exec "zip -r " + source_code_zip_file + " ."

cd svn_build_dir
exec "svn commit -m 'deploying'"
## should i do something for config.json as well ?

echo "Macの場合chromeでurl開いて叩きます ( \"open -a '/Applications/Google Chrome.app' \" + docker_build_url  )"
exec "open -a '/Applications/Google Chrome.app' " + docker_build_url
exec "open -a '/Applications/Google Chrome.app' " + cloud_os_core_apps_front_deploy_jenkins_url
