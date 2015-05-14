from project_module import project_object, image_object, link_object, challenge_object

p = project_object('LXR_tidy', 'LXR tidy')
p.domain = 'http://www.aidansean.com/'
p.path = 'LXR_tidy'
p.preview_image_ = image_object('http://placekitten.com.s3.amazonaws.com/homepage-samples/408/287.jpg', 408, 287)
p.folder_name = 'greasemonkey'
p.github_repo_name = 'LXR_tidy'
p.mathjax = False
p.links.append(link_object('http://cmslxr.fnal.gov/', 'lxr/', 'CMSSW LXR home'))
#p.links.append(link_object(p.domain, 'greasemonkey/greaseBox.php', 'Live page'))
p.introduction = 'When I was working on the CMS experiment I used their LXR a lot when browsing code.  The interface was fairly basic and would return a poorly formatted (and unsemantic) HTML output, so I write a greasemonkey script to make the results easier to read.  Within a couple of weeks of writing this code the developers improved the output, so this project never got any wider use.'
p.overview = '''The output is parsed and carefully separated into different results.  These are then wrapped in more pleasant looking HTML, colour coded based on the file type (with characters for the colour blind) and the main modules are summarised to give an idea of the main users of a given piece of code.'''

p.challenges.append(challenge_object('The default output is terrible.  Just terrible.', 'The default output was not even semantically correct (from what I remember there were no <tt>&lt;html&gt;</tt> tags) so I had a hard time parsing the DOM properly.  Special character sequences such as <tt>&lt;&lt;</tt> appearing in C++ code didn\'t make things much easier.', 'Resolved.'))
